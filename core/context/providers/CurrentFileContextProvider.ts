import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { getBasename } from "../../util/index.js";
import { BaseContextProvider } from "../index.js";

class CurrentFileContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "currentFile",
    displayTitle: "当前文件",
    description: "引用当前打开的文件",
    type: "normal",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const ide = extras.ide;
    const currentFile = await ide.getCurrentFile();
    if (!currentFile) {
      return [];
    }
    const contents = await ide.readFile(currentFile);
    return [
      {
        description: currentFile,
        content: `这是当前打开的文件:\n\n\`\`\`${getBasename(
          currentFile,
        )}\n${contents}\n\`\`\``,
        name: getBasename(currentFile),
      },
    ];
  }
}

export default CurrentFileContextProvider;
