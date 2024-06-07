import { Message } from "core/util/messenger";
import fs from "node:fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as vscode from "vscode";
import {
  ToCoreFromWebviewProtocol,
  ToWebviewFromCoreProtocol,
} from "../../../core/protocol/coreWebview";
import {
  ToIdeFromWebviewProtocol,
  ToWebviewFromIdeProtocol,
} from "../../../core/protocol/ideWebview";
import { IMessenger } from "../../../core/util/messenger";
import { getExtensionUri } from "./util/vscode";

export async function showTutorial() {
  const tutorialPath = path.join(
    getExtensionUri().fsPath,
    "continue_tutorial.py",
  );
  // 确保键盘快捷键与操作系统匹配
  if (process.platform !== "darwin") {
    let tutorialContent = fs.readFileSync(tutorialPath, "utf8");
    tutorialContent = tutorialContent.replace("⌘", "^").replace("Cmd", "Ctrl");
    fs.writeFileSync(tutorialPath, tutorialContent);
  }

  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.file(tutorialPath),
  );
  await vscode.window.showTextDocument(doc, { preview: false });
}

export type ToCoreOrIdeFromWebviewProtocol = ToCoreFromWebviewProtocol &
  ToIdeFromWebviewProtocol;
type FullToWebviewFromIdeOrCoreProtocol = ToWebviewFromIdeProtocol &
  ToWebviewFromCoreProtocol;
export class VsCodeWebviewProtocol
  implements
  IMessenger<
    ToCoreOrIdeFromWebviewProtocol,
    FullToWebviewFromIdeOrCoreProtocol
  > {
  listeners = new Map<
    keyof ToCoreOrIdeFromWebviewProtocol,
    ((message: Message) => any)[]
  >();

  send(messageType: string, data: any, messageId?: string): string {
    const id = messageId ?? uuidv4();
    this.webview?.postMessage({
      messageType,
      data,
      messageId: id,
    });
    return id;
  }

  on<T extends keyof ToCoreOrIdeFromWebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<ToCoreOrIdeFromWebviewProtocol[T][0]>,
    ) =>
      | Promise<ToCoreOrIdeFromWebviewProtocol[T][1]>
      | ToCoreOrIdeFromWebviewProtocol[T][1],
  ): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(handler);
  }

  _webview?: vscode.Webview;
  _webviewListener?: vscode.Disposable;

  get webview(): vscode.Webview | undefined {
    return this._webview;
  }

  set webview(webView: vscode.Webview) {
    this._webview = webView;
    this._webviewListener?.dispose();

    this._webviewListener = this._webview.onDidReceiveMessage(async (msg) => {
      if (!msg.messageType || !msg.messageId) {
        throw new Error(`无效的 webview 协议消息: ${JSON.stringify(msg)}`);
      }

      const respond = (message: any) =>
        this.send(msg.messageType, message, msg.messageId);

      const handlers = this.listeners.get(msg.messageType) || [];
      for (const handler of handlers) {
        try {
          const response = await handler(msg);
          if (
            response &&
            typeof response[Symbol.asyncIterator] === "function"
          ) {
            let next = await response.next();
            while (!next.done) {
              respond(next.value);
              next = await response.next();
            }
            respond({ done: true, content: next.value?.content });
          } else {
            respond(response || {});
          }
        } catch (e: any) {
          respond({ done: true, error: e });

          console.error(
            `处理 webview 消息时出错: ${JSON.stringify(
              { msg },
              null,
              2,
            )}\n\n${e}`,
          );

          let message = e.message;
          if (e.cause) {
            if (e.cause.name === "ConnectTimeoutError") {
              message = `连接超时。如果你预计连接需要更长时间，你可以在 config.json 中增加超时时间，通过设置 "requestOptions": { "timeout": 10000 }。你可以在这里找到完整的配置参考: https://docs.continue.dev/reference/config`;
            } else if (e.cause.code === "ECONNREFUSED") {
              message = `连接被拒绝。这可能意味着在指定的 URL 没有正在运行的服务器。如果你正在运行自己的服务器，你可能需要在 config.json 中设置 "apiBase" 参数。例如，你可以设置一个 OpenAI 兼容的服务器，如这里所示: https://docs.continue.dev/reference/Model%20Providers/openai#openai-compatible-servers--apis`;
            } else {
              message = `请求失败，原因是 "${e.cause.name}": ${e.cause.message}。如果你在设置 Continue 时遇到困难，请参阅故障排除指南以获得帮助。`;
            }
          }

          if (message.includes("https://proxy-server")) {
            message = message.split("\n").filter((l: string) => l !== "")[1];
            try {
              message = JSON.parse(message).message;
            } catch { }
            if (message.includes("exceeded")) {
              message +=
                " 要继续使用 Continue，你可以设置一个本地模型或使用你自己的 API 密钥。";
            }

            vscode.window
              .showInformationMessage(message, "添加 API 密钥", "使用本地模型")
              .then((selection) => {
                if (selection === "添加 API 密钥") {
                  this.request("addApiKey", undefined);
                } else if (selection === "使用本地模型") {
                  this.request("setupLocalModel", undefined);
                }
              });
          } else if (message.includes("请使用 GitHub 登录")) {
            vscode.window
              .showInformationMessage(
                message,
                "登录",
                "使用 API 密钥 / 本地模型",
              )
              .then((selection) => {
                if (selection === "登录") {
                  vscode.authentication
                    .getSession("github", [], {
                      createIfNone: true,
                    })
                    .then(() => {
                      this.reloadConfig();
                    });
                } else if (selection === "使用 API 密钥 / 本地模型") {
                  this.request("openOnboarding", undefined);
                }
              });
          } else {
            vscode.window
              .showErrorMessage(
                message.split("\n\n")[0],
                "显示日志",
                "故障排除",
              )
              .then((selection) => {
                if (selection === "显示日志") {
                  vscode.commands.executeCommand(
                    "workbench.action.toggleDevTools",
                  );
                } else if (selection === "故障排除") {
                  vscode.env.openExternal(
                    vscode.Uri.parse(
                      "https://docs.continue.dev/troubleshooting",
                    ),
                  );
                }
              });
          }
        }
      }
    });
  }

  constructor(private readonly reloadConfig: () => void) { }
  invoke<T extends keyof ToCoreOrIdeFromWebviewProtocol>(
    messageType: T,
    data: ToCoreOrIdeFromWebviewProtocol[T][0],
    messageId?: string,
  ): ToCoreOrIdeFromWebviewProtocol[T][1] {
    throw new Error("方法未实现。");
  }

  onError(handler: (error: Error) => void): void {
    throw new Error("方法未实现。");
  }

  public request<T extends keyof FullToWebviewFromIdeOrCoreProtocol>(
    messageType: T,
    data: FullToWebviewFromIdeOrCoreProtocol[T][0],
  ): Promise<FullToWebviewFromIdeOrCoreProtocol[T][1]> {
    const messageId = uuidv4();
    return new Promise(async (resolve) => {
      let i = 0;
      while (!this.webview) {
        if (i >= 10) {
          resolve(undefined);
          return;
        } else {
          await new Promise((res) => setTimeout(res, i >= 5 ? 1000 : 500));
          i++;
        }
      }

      this.send(messageType, data, messageId);
      const disposable = this.webview.onDidReceiveMessage(
        (msg: Message<FullToWebviewFromIdeOrCoreProtocol[T][1]>) => {
          if (msg.messageId === messageId) {
            resolve(msg.data);
            disposable?.dispose();
          }
        },
      );
    });
  }
}
