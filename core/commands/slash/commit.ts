import { SlashCommand } from "../../index.js";
import { stripImages } from "../../llm/countTokens.js";

const CommitMessageCommand: SlashCommand = {
  name: "commit",
  description: "为当前更改生成提交消息",
  run: async function* ({ ide, llm, input }) {
    const diff = await ide.getDiff();

    if (!diff || diff.trim() === "") {
      yield "未检测到更改。确保您在一个有当前更改的 Git 仓库中。";
      return;
    }

    const prompt = `${diff}\n\n为以上一组更改生成提交消息。首先，给出一个不超过 80 个字符的单句。然后，在两次换行后，给出不超过 5 个简短的项目符号，每个不超过 40 个字符。除了提交消息，不要输出其他任何内容，也不要用引号包围它。`;
    for await (const chunk of llm.streamChat([
      { role: "user", content: prompt },
    ])) {
      yield stripImages(chunk.content);
    }
  },
};

export default CommitMessageCommand;
