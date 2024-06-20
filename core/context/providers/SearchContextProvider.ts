import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class SearchContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "search",
    displayTitle: "搜索",
    description: "使用 ripgrep 精确搜索工作区",
    type: "query",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const results = await extras.ide.getSearchResults(query);
    return [
      {
        description: "搜索结果",
        content: `在代码库中搜索 "${query}" 的结果:\n\n${results}`,
        name: "搜索结果",
      },
    ];
  }
}

export default SearchContextProvider;
