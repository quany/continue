import * as fs from "node:fs";
import { homedir } from "node:os";
import path from "path";
import { languageForFilepath } from "../../autocomplete/constructPrompt.js";
import { SlashCommand } from "../../index.js";
import { stripImages } from "../../llm/countTokens.js";

// 如果在其他地方有用，辅助函数应移动到 core/util/index.ts 或类似位置
function getOffsetDatetime(date: Date): Date {
  const offset = date.getTimezoneOffset();
  const offsetHours = Math.floor(offset / 60);
  const offsetMinutes = offset % 60;
  date.setHours(date.getHours() - offsetHours);
  date.setMinutes(date.getMinutes() - offsetMinutes);

  return date;
}

function asBasicISOString(date: Date): string {
  const isoString = date.toISOString();

  return isoString.replace(/[-:]|(\.\d+Z)/g, "");
}

function reformatCodeBlocks(msgText: string): string {
  const codeBlockFenceRegex = /```((.*?\.(\w+))\s*.*)\n/g;
  msgText = msgText.replace(
    codeBlockFenceRegex,
    (match, metadata, filename, extension) => {
      const lang = languageForFilepath(filename);
      return `\`\`\`${extension}\n${lang.comment} ${metadata}\n`;
    },
  );
  // 满足 markdown linter
  return msgText.replace(/```\n```/g, "```\n\n```");
}

const ShareSlashCommand: SlashCommand = {
  name: "share",
  description: "将当前聊天会话导出为 markdown",
  run: async function* ({ ide, history, params }) {
    const now = new Date();

    let content = `### [Continue](https://continue.dev) 会话记录\n 导出时间: ${now.toLocaleString()}`;

    // 按目前的实现，/share 命令定义为聊天记录中的最后一条消息，这将忽略它
    for (const msg of history.slice(0, history.length - 1)) {
      let msgText = msg.content;
      msgText = stripImages(msg.content);

      if (msg.role === "user" && msgText.search("```") > -1) {
        msgText = reformatCodeBlocks(msgText);
      }

      // 将消息格式化为引用块
      msgText = msgText.replace(/^/gm, "> ");

      content += `\n\n#### ${msg.role === "user" ? "_用户_" : "_助手_"
        }\n\n${msgText}`;
    }

    let outputDir: string = params?.outputDir;
    if (!outputDir) {
      outputDir = await ide.getContinueDir();
    }

    if (outputDir.startsWith("~")) {
      outputDir = outputDir.replace(/^~/, homedir);
    } else if (
      outputDir.startsWith("./") ||
      outputDir.startsWith(".\\") ||
      outputDir === "."
    ) {
      const workspaceDirs = await ide.getWorkspaceDirs();
      // 尽管在工作区中打开一个目录是最常见的情况，但也可能仅打开一个没有关联目录的文件，或使用多根工作区，其中包含多个文件夹。我们默认使用列表中的第一个项目（如果存在）。
      const workspaceDirectory = workspaceDirs?.[0] || "";
      outputDir = outputDir.replace(/^./, workspaceDirectory);
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const dtString = asBasicISOString(getOffsetDatetime(now));
    const outPath = path.join(outputDir, `${dtString}_session.md`); //TODO: 更灵活的命名？

    await ide.writeFile(outPath, content);
    await ide.openFile(outPath);

    yield `会话记录已保存到 \`${outPath}\` 的 markdown 文件中。`;
  },
};

export default ShareSlashCommand;
