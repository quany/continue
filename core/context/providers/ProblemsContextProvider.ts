import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { getBasename } from "../../util/index.js";
import { BaseContextProvider } from "../index.js";

class ProblemsContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "problems",
    displayTitle: "问题",
    description: "引用当前文件中的问题",
    type: "normal",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const ide = extras.ide;
    const problems = await ide.getProblems();

    const items = await Promise.all(
      problems.map(async (problem) => {
        const content = await ide.readFile(problem.filepath);
        const lines = content.split("\n");
        const rangeContent = lines
          .slice(
            Math.max(0, problem.range.start.line - 2),
            problem.range.end.line + 2,
          )
          .join("\n");

        return {
          description: "当前文件中的问题",
          content: `\`\`\`${getBasename(
            problem.filepath,
          )}\n${rangeContent}\n\`\`\`\n${problem.message}\n\n`,
          name: `在 ${getBasename(problem.filepath)} 中的警告`,
        };
      }),
    );

    return items.length === 0
      ? [
        {
          description: "当前文件中的问题",
          content: "在打开的文件中没有发现问题。",
          name: "未发现问题",
        },
      ]
      : items;
  }
}

export default ProblemsContextProvider;
