import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class DiffContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "diff",
    displayTitle: "Git 差异",
    description: "引用当前的 Git 差异",
    type: "normal",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const diff = await extras.ide.getDiff();
    return [
      {
        description: "当前的 Git 差异",
        content:
          diff.trim() === ""
            ? "Git 显示当前没有更改。"
            : `\`\`\`git diff\n${diff}\n\`\`\``,
        name: "Git 差异",
      },
    ];
  }
}

export default DiffContextProvider;
