import { streamLines } from "../../diff/util.js";
import { SlashCommand } from "../../index.js";
import { removeQuotesAndEscapes } from "../../util/index.js";

const GenerateTerminalCommand: SlashCommand = {
  name: "cmd",
  description: "生成一个 shell 命令",
  run: async function* ({ ide, llm, input }) {
    const gen =
      llm.streamComplete(`用户请求运行一个 shell 命令。他们的描述如下：

"${input}"

请编写一个 shell 命令来完成用户的请求。您的输出应仅包含命令本身，没有任何解释或示例输出。不要使用任何换行符。仅输出命令，当插入到终端时，命令将准确执行请求。命令如下：`);

    const lines = streamLines(gen);
    let cmd = "";
    for await (const line of lines) {
      console.log(line);
      if (line.startsWith("```") && line.endsWith("```")) {
        cmd = line.split(" ").slice(1).join(" ").slice(0, -3);
        break;
      }

      if (
        line.startsWith(">") ||
        line.startsWith("``") ||
        line.startsWith("\\begin{") ||
        line.trim() === ""
      ) {
        continue;
      }

      cmd = removeQuotesAndEscapes(line.trim());
      break;
    }

    await ide.runCommand(cmd);
    yield `生成的 shell 命令：${cmd}`;
  },
};

export default GenerateTerminalCommand;
