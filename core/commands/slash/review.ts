import { ChatMessage, SlashCommand } from "../../index.js";
import { stripImages } from "../../llm/countTokens.js";

const prompt = `
     请审查以下代码，重点关注可读性、可维护性、代码异味、速度和内存性能。请按照以下指南提供反馈：

     语气：使用友好随意的工程师语气，确保反馈清晰且专注于实际改进。
     有序分析：从上到下按顺序处理代码，以确保全面审查而不跳过任何部分。
     描述性反馈：避免直接引用行号，因为它们可能会有所不同。相反，描述需要注意的代码部分或特定结构，清楚地解释原因。
     提供示例：对于发现的每个问题，提供一个示例，说明如何改进或重写代码以提高清晰度、性能或可维护性。
     您的回应应首先识别问题，然后解释为什么这是一个问题，最后提供一个带有示例代码的解决方案。`;

function getLastUserHistory(history: ChatMessage[]): string {
  const lastUserHistory = history
    .reverse()
    .find((message) => message.role === "user");

  if (!lastUserHistory) {
    return "";
  }

  if (Array.isArray(lastUserHistory.content)) {
    return lastUserHistory.content.reduce(
      (acc: string, current: { type: string; text?: string }) => {
        return current.type === "text" && current.text
          ? acc + current.text
          : acc;
      },
      "",
    );
  }

  return typeof lastUserHistory.content === "string"
    ? lastUserHistory.content
    : "";
}

const ReviewMessageCommand: SlashCommand = {
  name: "review",
  description: "审查代码并提供反馈",
  run: async function* ({ llm, history }) {
    const reviewText = getLastUserHistory(history).replace("\\review", "");

    const content = `${prompt} \r\n ${reviewText}`;

    for await (const chunk of llm.streamChat([
      { role: "user", content: content },
    ])) {
      yield stripImages(chunk.content);
    }
  },
};

export default ReviewMessageCommand;
