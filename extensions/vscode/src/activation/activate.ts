import { getTsConfigPath, migrate } from "core/util/paths";
import { Telemetry } from "core/util/posthog";
import path from "node:path";
import * as vscode from "vscode";
import { VsCodeExtension } from "../extension/vscodeExtension";
import registerQuickFixProvider from "../lang-server/codeActions";
import { getExtensionVersion } from "../util/util";
import { getExtensionUri } from "../util/vscode";
import { VsCodeContinueApi } from "./api";
import { setupInlineTips } from "./inlineTips";

let resolveVsCodeExtension = (_: VsCodeExtension): void => { };
export const vscodeExtensionPromise: Promise<VsCodeExtension> = new Promise(
  (resolve) => (resolveVsCodeExtension = resolve),
);

export async function activateExtension(context: vscode.ExtensionContext): Promise<any> {
  try {
    // Add necessary files
    getTsConfigPath();

    // Register commands and providers
    registerQuickFixProvider();
    setupInlineTips(context);

    const vscodeExtension = new VsCodeExtension(context);
    resolveVsCodeExtension(vscodeExtension);

    // Migrate using safe execution
    migrate("showWelcome_1", () => safeExecuteCommand());

    // Load Continue configuration with safe global state update
    safeUpdateGlobalState(context);

    const api = new VsCodeContinueApi(vscodeExtension);
    const continuePublicApi = {
      registerCustomContextProvider: api.registerCustomContextProvider.bind(api),
    };

    return continuePublicApi;
  } catch (error) {
    console.error("Failed to activate extension:", error);
    // @ts-ignore
    vscode.window.showErrorMessage(`Extension activation failed: ${error.message}`);
    throw error; // Re-throw the error to ensure it's not silently swallowed
  }
}

// Wrap command execution in a try-catch to handle potential errors
function safeExecuteCommand() {
  vscode.commands.executeCommand(
    "markdown.showPreview",
    vscode.Uri.file(
      path.join(getExtensionUri().fsPath, "media", "welcome.md"),
    ),
  );
}

// Safely update the global state with error handling
function safeUpdateGlobalState(context: vscode.ExtensionContext) {
  if (!context.globalState.get("hasBeenInstalled")) {
    try {
      context.globalState.update("hasBeenInstalled", true);
      Telemetry.capture("install", {
        extensionVersion: getExtensionVersion(),
      });
    } catch (error) {
      console.error("Failed to update global state:", error);
      // @ts-ignore
      vscode.window.showErrorMessage(`Failed to update extension state: ${error.message}`);
    }
  }
}