/**
 * 这是扩展的入口点。
 */

import { Telemetry } from "core/util/posthog";
import * as vscode from "vscode";
import { getExtensionVersion } from "./util/util";

async function dynamicImportAndActivate(context: vscode.ExtensionContext) {
  const { activateExtension } = await import("./activation/activate");
  try {
    return activateExtension(context);
  } catch (e) {
    console.log("激活扩展时出错: ", e);
    vscode.window
      .showInformationMessage(
        "激活 Continue 扩展时发生错误。",
        "查看日志",
        "重试",
      )
      .then((selection) => {
        if (selection === "查看日志") {
          vscode.commands.executeCommand("continue.viewLogs");
        } else if (selection === "重试") {
          // 重新加载 VS Code 窗口
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  }
}

export function activate(context: vscode.ExtensionContext) {
  return dynamicImportAndActivate(context);
}

export function deactivate() {
  Telemetry.capture("deactivate", {
    extensionVersion: getExtensionVersion(),
  });

  Telemetry.shutdownPosthogClient();
}