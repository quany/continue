import { ChatMessage, SlashCommand } from "../../index.js";
import { stripImages } from "../../llm/countTokens.js";
import { removeQuotesAndEscapes } from "../../util/index.js";

const PROMPT = (
  input: string,
  title: string,
) => `您将被要求根据用户请求生成一个 GitHub 问题的主体。您应遵循以下规则：
- 要描述详细，但不要编造细节
- 如果用户请求中包含任何相关的代码片段，请在代码块中引用它们
- 逐步描述如何重现该问题
- 描述问题的理想解决方案
- 描述问题解决后的预期行为
- 此问题将由团队成员读取
- 使用 Markdown 格式，但您不需要用三个反引号将整个正文包围
{additional_instructions}

以下是用户的请求: '${input}'

标题: ${title}

正文:\n\n`;

const DraftIssueCommand: SlashCommand = {
  name: "issue",
  description: "起草一个 GitHub 问题",
  run: async function* ({ input, llm, history, params }) {
    if (params?.repositoryUrl === undefined) {
      yield "此命令需要在配置文件中设置存储库 URL。";
      return;
    }
    let title = await llm.complete(
      `为此用户输入请求的 GitHub 问题生成一个标题: '${input}'。不要超过 20 个字，并且只输出标题。不要用引号包围它。标题是: `,
      { maxTokens: 20 },
    );

    title = `${removeQuotesAndEscapes(title.trim())}\n\n`;
    yield title;

    let body = "";
    const messages: ChatMessage[] = [
      ...history,
      { role: "user", content: PROMPT(input, title) },
    ];

    for await (const chunk of llm.streamChat(messages)) {
      body += chunk.content;
      yield stripImages(chunk.content);
    }

    const url = `${params.repositoryUrl}/issues/new?title=${encodeURIComponent(
      title,
    )}&body=${encodeURIComponent(body)}`;
    yield `\n\n[问题草稿链接](${url})`;
  },
};

export default DraftIssueCommand;
