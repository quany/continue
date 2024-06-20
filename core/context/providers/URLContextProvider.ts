import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { NodeHtmlMarkdown } from "node-html-markdown";
import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class URLContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "url",
    displayTitle: "URL",
    description: "引用给定URL的网页",
    type: "query",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    try {
      const url = new URL(query);
      const resp = await extras.fetch(url);
      const html = await resp.text();

      const dom = new JSDOM(html);
      let reader = new Readability(dom.window.document);
      let article = reader.parse();
      const content = article?.content || "";
      const markdown = NodeHtmlMarkdown.translate(
        content,
        {},
        undefined,
        undefined,
      );

      const title = article?.title || url.pathname;
      return [
        {
          description: title,
          content: markdown,
          name: title,
        },
      ];
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}

export default URLContextProvider;
