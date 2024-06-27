import {
  filterCodeBlockLines,
  filterEnglishLinesAtEnd,
  filterEnglishLinesAtStart,
  fixCodeLlamaFirstLineIndentation,
  stopAtLines,
  streamWithNewLines,
} from "../../autocomplete/lineStream.js";
import { streamLines } from "../../diff/util.js";
import { ContextItemWithId, ILLM, SlashCommand } from "../../index.js";
import { stripImages } from "../../llm/countTokens.js";
import {
  dedentAndGetCommonWhitespace,
  getMarkdownLanguageTagForFile,
} from "../../util/index.js";
import {
  contextItemToRangeInFileWithContents,
  type RangeInFileWithContents,
} from "../util.js";

const PROMPT = `考虑文件前缀和后缀，但仅按用户请求重写 code_to_edit 中的代码。您在 modified_code_to_edit 中编写的代码将替换 code_to_edit 标签之间的代码。不要以任何方式在答案前面加上前缀或写任何代码以外的内容。应写 </modified_code_to_edit> 标签以指示修改代码部分的结束。永远不要使用嵌套标签。

示例：

<file_prefix>
class Database:
    def __init__(self):
        self._data = {{}}

    def get(self, key):
        return self._data[key]

</file_prefix>
<code_to_edit>
    def set(self, key, value):
        self._data[key] = value
</code_to_edit>
<file_suffix>

    def clear_all():
        self._data = {{}}
</file_suffix>
<user_request>
如果键已存在，则抛出错误。
</user_request>
<modified_code_to_edit>
    def set(self, key, value):
        if key in self._data:
            raise KeyError(f"Key {{key}} already exists")
        self._data[key] = value
</modified_code_to_edit>

主要任务：
`;

export async function getPromptParts(
  rif: RangeInFileWithContents,
  fullFileContents: string,
  model: ILLM,
  input: string,
  tokenLimit: number | undefined,
) {
  const maxTokens = Math.floor(model.contextLength / 2);

  const TOKENS_TO_BE_CONSIDERED_LARGE_RANGE = tokenLimit ?? 1200;
  // if (model.countTokens(rif.contents) > TOKENS_TO_BE_CONSIDERED_LARGE_RANGE) {
  //   throw new Error(
  //     "\n\n**看起来您选择了一个较大的范围进行编辑，这可能需要一段时间才能完成。如果您想取消，请点击上方的 'X' 按钮。如果您选择一个更具体的范围，Continue 将仅在该范围内进行编辑。**"
  //   );
  // }

  const BUFFER_FOR_FUNCTIONS = 400;
  let totalTokens =
    model.countTokens(fullFileContents + PROMPT + input) +
    BUFFER_FOR_FUNCTIONS +
    maxTokens;

  const fullFileContentsList = fullFileContents.split("\n");
  const maxStartLine = rif.range.start.line;
  const minEndLine = rif.range.end.line;
  let curStartLine = 0;
  let curEndLine = fullFileContentsList.length - 1;

  if (totalTokens > model.contextLength) {
    while (curEndLine > minEndLine) {
      totalTokens -= model.countTokens(fullFileContentsList[curEndLine]);
      curEndLine--;
      if (totalTokens < model.contextLength) {
        break;
      }
    }
  }

  if (totalTokens > model.contextLength) {
    while (curStartLine < maxStartLine) {
      curStartLine++;
      totalTokens -= model.countTokens(fullFileContentsList[curStartLine]);
      if (totalTokens < model.contextLength) {
        break;
      }
    }
  }

  let filePrefix = fullFileContentsList
    .slice(curStartLine, maxStartLine)
    .join("\n");
  let fileSuffix = fullFileContentsList
    .slice(minEndLine, curEndLine - 1)
    .join("\n");

  if (rif.contents.length > 0) {
    let lines = rif.contents.split(/\r?\n/);
    let firstLine = lines[0] || null;
    while (firstLine && firstLine.trim() === "") {
      filePrefix += firstLine;
      rif.contents = rif.contents.substring(firstLine.length);
      lines = rif.contents.split(/\r?\n/);
      firstLine = lines[0] || null;
    }

    let lastLine = lines[lines.length - 1] || null;
    while (lastLine && lastLine.trim() === "") {
      fileSuffix = lastLine + fileSuffix;
      rif.contents = rif.contents.substring(
        0,
        rif.contents.length - lastLine.length,
      );
      lines = rif.contents.split(/\r?\n/);
      lastLine = lines[lines.length - 1] || null;
    }

    while (rif.contents.startsWith("\n")) {
      filePrefix += "\n";
      rif.contents = rif.contents.substring(1);
    }
    while (rif.contents.endsWith("\n")) {
      fileSuffix = `\n${fileSuffix}`;
      rif.contents = rif.contents.substring(0, rif.contents.length - 1);
    }
  }
  return { filePrefix, fileSuffix, contents: rif.contents, maxTokens };
}

function compilePrompt(
  filePrefix: string,
  contents: string,
  fileSuffix: string,
  input: string,
): string {
  if (contents.trim() === "") {
    // 插入光标处的单独提示，避免使用重复整个文件的提示
    return `\
<file_prefix>
${filePrefix}
</file_prefix>
<insertion_code_here>
<file_suffix>
${fileSuffix}
</file_suffix>
<user_request>
${input}
</user_request>

请输出要插入光标处的代码以满足用户请求。不要在答案前面加前缀或写任何其他内容。您不应写任何标签，只写代码。确保正确缩进代码：`;
  }

  let prompt = PROMPT;
  if (filePrefix.trim() !== "") {
    prompt += `
<file_prefix>
${filePrefix}
</file_prefix>`;
  }
  prompt += `
<code_to_edit>
${contents}
</code_to_edit>`;

  if (fileSuffix.trim() !== "") {
    prompt += `
<file_suffix>
${fileSuffix}
</file_suffix>`;
  }
  prompt += `
<user_request>
${input}
</user_request>
<modified_code_to_edit>
`;

  return prompt;
}

function isEndLine(line: string) {
  return (
    line.includes("</modified_code_to_edit>") ||
    line.includes("</code_to_edit>") ||
    line.includes("[/CODE]")
  );
}

function lineToBeIgnored(line: string, isFirstLine = false): boolean {
  return (
    line.includes("```") ||
    line.includes("<modified_code_to_edit>") ||
    line.includes("<file_prefix>") ||
    line.includes("</file_prefix>") ||
    line.includes("<file_suffix>") ||
    line.includes("</file_suffix>") ||
    line.includes("<user_request>") ||
    line.includes("</user_request>") ||
    line.includes("<code_to_edit>")
  );
}

const EditSlashCommand: SlashCommand = {
  name: "edit",
  description: "编辑选中代码",
  run: async function* ({ ide, llm, input, history, contextItems, params }) {
    let contextItemToEdit = contextItems.find(
      (item: ContextItemWithId) =>
        item.editing && item.id.providerTitle === "code",
    );
    if (!contextItemToEdit) {
      contextItemToEdit = contextItems.find(
        (item: ContextItemWithId) => item.id.providerTitle === "code",
      );
    }

    if (!contextItemToEdit) {
      yield "请高亮你要编辑的代码，然后按 cmd/ctrl+shift+L 将其添加到聊天中";
      return;
    }

    // 去除输入中不必要的部分（必须重构，当前方法不理想）
    let content = history[history.length - 1].content;
    if (typeof content !== "string") {
      content.forEach((part) => {
        if (part.text?.startsWith("/edit")) {
          part.text = part.text.replace("/edit", "").trimStart();
        }
      });
    } else {
      content = input.replace("/edit", "").trimStart();
    }
    const userInput = stripImages(content).replace(
      `\`\`\`${contextItemToEdit.name}\n${contextItemToEdit.content}\n\`\`\`\n`,
      "",
    );

    const rif: RangeInFileWithContents =
      contextItemToRangeInFileWithContents(contextItemToEdit);

    await ide.saveFile(rif.filepath);
    const fullFileContents = await ide.readFile(rif.filepath);

    let { filePrefix, contents, fileSuffix, maxTokens } = await getPromptParts(
      rif,
      fullFileContents,
      llm,
      userInput,
      params?.tokenLimit,
    );
    const [dedentedContents, commonWhitespace] =
      dedentAndGetCommonWhitespace(contents);
    contents = dedentedContents;

    const prompt = compilePrompt(filePrefix, contents, fileSuffix, userInput);
    const fullFileContentsLines = fullFileContents.split("\n");
    const fullPrefixLines = fullFileContentsLines.slice(
      0,
      Math.max(0, rif.range.start.line - 1),
    );
    const fullSuffixLines = fullFileContentsLines.slice(rif.range.end.line);

    let linesToDisplay: string[] = [];

    async function sendDiffUpdate(lines: string[], final = false) {
      const completion = lines.join("\n");

      // 在最后阶段，不要再重新计算，只显示插入的代码
      if (final) {
        linesToDisplay = [];
      }

      // 仅在每个新行时重新计算，因为此操作有点耗时
      else if (completion.endsWith("\n")) {
        const contentsLines = rif.contents.split("\n");
        let rewrittenLines = 0;
        for (const line of lines) {
          for (let i = rewrittenLines; i < contentsLines.length; i++) {
            if (
              //   difflib.SequenceMatcher(
              //     null, line, contentsLines[i]
              //   ).ratio()
              //   > 0.7
              line.trim() === contentsLines[i].trim() && // 临时代替 difflib 的方法（TODO）
              contentsLines[i].trim() !== ""
            ) {
              rewrittenLines = i + 1;
              break;
            }
          }
        }
        linesToDisplay = contentsLines.slice(rewrittenLines);
      }

      const newFileContents = `${fullPrefixLines.join("\n")}\n${completion}\n${linesToDisplay.length > 0 ? `${linesToDisplay.join("\n")}\n` : ""
        }${fullSuffixLines.join("\n")}`;

      const stepIndex = history.length - 1;

      await ide.showDiff(rif.filepath, newFileContents, stepIndex);
    }

    // 重要的状态变量
    // -------------------------
    const originalLines = rif.contents === "" ? [] : rif.contents.split("\n");
    // 在实际文件中，考虑块偏移
    let currentLineInFile = rif.range.start.line;
    let currentBlockLines: string[] = [];
    let originalLinesBelowPreviousBlocks = originalLines;
    // 当前块在文件中的起始位置，考虑块偏移
    let currentBlockStart = -1;
    let offsetFromBlocks = 0;

    // 在结束块之前，不要结束块
    // 这有助于避免许多微小的块
    const LINES_TO_MATCH_BEFORE_ENDING_BLOCK = 2;
    // 如果在块结束时匹配到一行，则这是 originalLinesBelowPreviousBlocks 中的索引
    // 但我们正在跟踪多个潜在情况，因此它是一个列表
    // 我们总是检查每个 lead 的后续行，但如果多个 lead 在最后存活，我们使用第一个 lead
    // 这是 (index_of_last_matched_line, number_of_lines_matched) 的元组
    let indicesOfLastMatchedLines: [number, number][] = [];

    async function handleGeneratedLine(line: string) {
      if (currentBlockLines.length === 0) {
        // 将其设置为下一个块的开始
        currentBlockStart =
          rif.range.start.line +
          originalLines.length -
          originalLinesBelowPreviousBlocks.length +
          offsetFromBlocks;
        if (
          originalLinesBelowPreviousBlocks.length > 0 &&
          line === originalLinesBelowPreviousBlocks[0]
        ) {
          // 该行等于文件中的下一行，跳过此行
          originalLinesBelowPreviousBlocks =
            originalLinesBelowPreviousBlocks.slice(1);
          return;
        }
      }

      // 在块中，已经匹配到至少一行
      // 检查下一行是否匹配，对于每个候选者
      const matchesFound: any[] = [];
      let firstValidMatch: any = null;
      for (const [
        index_of_last_matched_line,
        num_lines_matched,
      ] of indicesOfLastMatchedLines) {
        if (
          index_of_last_matched_line + 1 <
          originalLinesBelowPreviousBlocks.length &&
          line ===
          originalLinesBelowPreviousBlocks[index_of_last_matched_line + 1]
        ) {
          matchesFound.push([
            index_of_last_matched_line + 1,
            num_lines_matched + 1,
          ]);
          if (
            firstValidMatch === null &&
            num_lines_matched + 1 >= LINES_TO_MATCH_BEFORE_ENDING_BLOCK
          ) {
            firstValidMatch = [
              index_of_last_matched_line + 1,
              num_lines_matched + 1,
            ];
          }
        }
      }
      indicesOfLastMatchedLines = matchesFound;

      if (firstValidMatch !== null) {
        // 我们匹配到了所需的行数，插入建议！

        // 我们向块中添加了一些已匹配的行（可能包括一些空行）
        // 因此，在这里我们将从 currentBlockLines 末尾删除所有匹配的行
        const linesStripped: string[] = [];
        let indexOfLastLineInBlock: number = firstValidMatch[0];
        while (
          currentBlockLines.length > 0 &&
          currentBlockLines[currentBlockLines.length - 1] ===
          originalLinesBelowPreviousBlocks[indexOfLastLineInBlock - 1]
        ) {
          linesStripped.push(currentBlockLines.pop() as string);
          indexOfLastLineInBlock -= 1;
        }

        // 重置当前块/更新变量
        currentLineInFile += 1;
        offsetFromBlocks += currentBlockLines.length;
        originalLinesBelowPreviousBlocks =
          originalLinesBelowPreviousBlocks.slice(indexOfLastLineInBlock + 1);
        currentBlockLines = [];
        currentBlockStart = -1;
        indicesOfLastMatchedLines = [];

        return;
      }

      // 始终寻找新的匹配候选者
      const newMatches: any[] = [];
      for (let i = 0; i < originalLinesBelowPreviousBlocks.length; i++) {
        const ogLine = originalLinesBelowPreviousBlocks[i];
        // TODO: 这里排除空行有点可疑。
        // 理想情况下，您会找到所有匹配项，然后在检查后续行时将其剔除
        if (ogLine === line) {
          // and og_line.trim() !== "":
          newMatches.push([i, 1]);
        }
      }
      indicesOfLastMatchedLines = indicesOfLastMatchedLines.concat(newMatches);

      // 确保它们按索引排序
      indicesOfLastMatchedLines = indicesOfLastMatchedLines.sort(
        (a, b) => a[0] - b[0],
      );

      currentBlockLines.push(line);
    }

    let messages = history;
    messages[messages.length - 1] = { role: "user", content: prompt };

    let linesOfPrefixCopied = 0;
    const lines = [];
    let unfinishedLine = "";
    let completionLinesCovered = 0;
    let repeatingFileSuffix = false;
    const lineBelowHighlightedRange = fileSuffix.trim().split("\n")[0];

    // 使用模型定义的自定义模板
    const template = llm.promptTemplates?.edit;
    let generator: AsyncGenerator<string>;
    if (template) {
      const rendered = llm.renderPromptTemplate(
        template,
        // typeof template === 'string' ? template : template.prompt,
        messages.slice(0, messages.length - 1),
        {
          codeToEdit: rif.contents,
          userInput,
          filePrefix: filePrefix,
          fileSuffix: fileSuffix,

          // 一些内置模板使用这些参数而不是上面的
          prefix: filePrefix,
          suffix: fileSuffix,

          language: getMarkdownLanguageTagForFile(rif.filepath),
          systemMessage: llm.systemMessage ?? "",
          // "contextItems": (await sdk.getContextItemChatMessages()).map(x => x.content || "").join("\n\n"),
        },
      );
      if (typeof rendered === "string") {
        messages = [
          {
            role: "user",
            content: rendered,
          },
        ];
      } else {
        messages = rendered;
      }

      const completion = llm.streamComplete(rendered as string, {
        maxTokens: Math.min(maxTokens, Math.floor(llm.contextLength / 2), 4096),
        raw: true,
      });
      let lineStream = streamLines(completion);

      lineStream = filterEnglishLinesAtStart(lineStream);

      lineStream = filterEnglishLinesAtEnd(filterCodeBlockLines(lineStream));
      lineStream = stopAtLines(lineStream);

      generator = streamWithNewLines(
        fixCodeLlamaFirstLineIndentation(lineStream),
      );
    } else {
      async function* gen() {
        for await (const chunk of llm.streamChat(messages, {
          temperature: 0.5, // TODO
          maxTokens: Math.min(
            maxTokens,
            Math.floor(llm.contextLength / 2),
            4096,
          ),
        })) {
          yield stripImages(chunk.content);
        }
      }

      generator = gen();
    }

    for await (const chunk of generator) {
      // 如果它重复文件后缀或步骤已删除，请提前停止
      if (repeatingFileSuffix) {
        break;
      }

      // 允许停止断点
      yield undefined;

      // 累积行
      const chunkLines = chunk.split("\n");
      chunkLines[0] = unfinishedLine + chunkLines[0];
      if (chunk.endsWith("\n")) {
        unfinishedLine = "";
        chunkLines.pop(); // 因为这将是一个空字符串
      } else {
        unfinishedLine = chunkLines.pop() ?? "";
      }

      // 处理新累积的行
      for (let i = 0; i < chunkLines.length; i++) {
        // 尾随空格不重要
        chunkLines[i] = chunkLines[i].trimEnd();
        chunkLines[i] = commonWhitespace + chunkLines[i];

        // 行应标志生成结束
        if (isEndLine(chunkLines[i])) {
          break;
        }
        // 应忽略的行，如 <> 标签
        if (lineToBeIgnored(chunkLines[i], completionLinesCovered === 0)) {
          continue; // 不错
        }
        // 检查当前是否仅复制前缀
        if (
          (linesOfPrefixCopied > 0 || completionLinesCovered === 0) &&
          linesOfPrefixCopied < filePrefix.split("\n").length &&
          chunkLines[i] === fullPrefixLines[linesOfPrefixCopied]
        ) {
          // 这是防止重复文件前缀的一种草率方法。如果输出恰好有匹配的行，则为错误
          linesOfPrefixCopied += 1;
          continue; // 也不错
        }
        // 因为非常短的行可能被期望重复，所以这只是一个 !启发式!
        // 当它开始复制文件后缀时停止
        if (
          chunkLines[i].trim() === lineBelowHighlightedRange.trim() &&
          chunkLines[i].trim().length > 4 &&
          !(
            originalLinesBelowPreviousBlocks.length > 0 &&
            chunkLines[i].trim() === originalLinesBelowPreviousBlocks[0].trim()
          )
        ) {
          repeatingFileSuffix = true;
          break;
        }

        lines.push(chunkLines[i]);
        completionLinesCovered += 1;
        currentLineInFile += 1;
      }

      await sendDiffUpdate(
        lines.concat([
          unfinishedLine?.startsWith("<")
            ? commonWhitespace
            : commonWhitespace + unfinishedLine,
        ]),
      );
    }

    // 添加未完成的行
    if (
      unfinishedLine !== "" &&
      !lineToBeIgnored(unfinishedLine, completionLinesCovered === 0) &&
      !isEndLine(unfinishedLine)
    ) {
      unfinishedLine = commonWhitespace + unfinishedLine;
      lines.push(unfinishedLine);
      await handleGeneratedLine(unfinishedLine);
      completionLinesCovered += 1;
      currentLineInFile += 1;
    }

    await sendDiffUpdate(lines, true);

    if (params?.recap) {
      const prompt = `这是编辑前的代码：
\`\`\`
${contents}
\`\`\`

这是编辑后的代码：

\`\`\`
${lines.join("\n")}
\`\`\`

请简要说明对上述代码所做的更改。不要超过 2-3 句，并使用 markdown 列表：`;

      for await (const update of llm.streamComplete(prompt)) {
        yield update;
      }
    }
  },
};

export default EditSlashCommand;
