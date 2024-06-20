import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { getBasename } from "../../util/index.js";
import { BaseContextProvider } from "../index.js";

// import { getOutlines } from "llm-code-highlighter/dist/index.continue";

class CodeOutlineContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "outline",
    displayTitle: "大纲",
    description: "仅定义行（来自打开的文件）",
    type: "normal",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const ide = extras.ide;
    const openFiles = await ide.getOpenFiles();
    const allFiles: { name: string; absPath: string; content: string }[] =
      await Promise.all(
        openFiles.map(async (filepath: string) => {
          return {
            name: getBasename(filepath),
            absPath: filepath,
            content: `${await ide.readFile(filepath)}`,
          };
        }),
      );
    // const outlines = await getOutlines(
    //   allFiles
    //     .filter((file) => file.content.length > 0)
    //     .map((file) => {
    //       return {
    //         relPath: file.name,
    //         code: file.content,
    //       };
    //     })
    // );
    // return [
    //   {
    //     content: outlines ? outlines : "",
    //     name: "代码大纲",
    //     description: "仅定义行（来自打开的文件）",
    //   },
    // ];
    return [];
  }

  async load(): Promise<void> { }
}

export default CodeOutlineContextProvider;
