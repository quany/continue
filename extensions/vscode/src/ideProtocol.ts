
import type {
  FileType,
  IDE,
  IdeInfo,
  IndexTag,
  Problem,
  Range,
  Thread
} from "core";
import { IdeSettings } from "core/protocol/ideWebview";
import * as vscode from "vscode";
import { Repository } from "./otherExtensions/git";

class VsCodeIde implements IDE {
  // ... 类的实现部分保持不变

  async getGitHubAuthToken(): Promise<string | undefined> {
    // ... 获取 GitHub 授权令牌的方法实现
  }

  async infoPopup(message: string): Promise<void> {
    vscode.window.showInformationMessage(message);
  }

  async errorPopup(message: string): Promise<void> {
    vscode.window.showErrorMessage(message);
  }

  async getRepoName(dir: string): Promise<string | undefined> {
    // ... 获取仓库名称的方法实现
  }

  async getTags(artifactId: string): Promise<IndexTag[]> {
    // ... 获取标签的方法实现
  }

  getIdeInfo(): Promise<IdeInfo> {
    // ... 获取 IDE 信息的方法实现
  }

  readRangeInFile(filepath: string, range: Range): Promise<string> {
    // ... 读取文件范围内内容的方法实现
  }

  async getLastModified(files: string[]): Promise<{ [path: string]: number }> {
    // ... 获取最后修改时间的方法实现
  }

  async getRepo(dir: vscode.Uri): Promise<Repository | undefined> {
    // ... 获取仓库的方法实现
  }

  async isTelemetryEnabled(): Promise<boolean> {
    // ... 检查是否启用了遥测的方法实现
  }

  getUniqueId(): Promise<string> {
    // ... 获取唯一标识的方法实现
  }

  async getDiff(): Promise<string> {
    // ... 获取差异的方法实现
  }

  async getTerminalContents(): Promise<string> {
    // ... 获取终端内容的方法实现
  }

  async getDebugLocals(threadIndex: number): Promise<string> {
    // ... 获取调试局部变量的方法实现
  }

  async getTopLevelCallStackSources(
    threadIndex: number,
    stackDepth: number,
  ): Promise<string[]> {
    // ... 获取顶级调用堆栈源的方法实现
  }

  async getAvailableThreads(): Promise<Thread[]> {
    // ... 获取可用线程的方法实现
  }

  async listWorkspaceContents(directory?: string): Promise<string[]> {
    // ... 列出工作区内容的方法实现
  }

  async getWorkspaceConfigs() {
    // ... 获取工作区配置的方法实现
  }

  async listFolders(): Promise<string[]> {
    // ... 列出文件夹的方法实现
  }

  async getWorkspaceDirs(): Promise<string[]> {
    // ... 获取工作区目录的方法实现
  }

  async getContinueDir(): Promise<string> {
    // ... 获取 Continue 目录的方法实现
  }

  async writeFile(path: string, contents: string): Promise<void> {
    // ... 写文件的方法实现
  }

  async showVirtualFile(title: string, contents: string): Promise<void> {
    // ... 显示虚拟文件的方法实现
  }

  async openFile(path: string): Promise<void> {
    // ... 打开文件的方法实现
  }

  async showLines(
    filepath: string,
    startLine: number,
    endLine: number,
  ): Promise<void> {
    // ... 显示行的方法实现
  }

  async runCommand(command: string): Promise<void> {
    // ... 运行命令的方法实现
  }

  async saveFile(filepath: string): Promise<void> {
    // ... 保存文件的方法实现
  }

  async readFile(filepath: string): Promise<string> {
    // ... 读取文件的方法实现
  }

  async showDiff(
    filepath: string,
    newContents: string,
    stepIndex: number,
  ): Promise<void> {
    // ... 显示差异的方法实现
  }

  async getOpenFiles(): Promise<string[]> {
    // ... 获取打开的文件的方法实现
  }

  async getCurrentFile(): Promise<string | undefined> {
    // ... 获取当前文件的方法实现
  }

  async getPinnedFiles(): Promise<string[]> {
    // ... 获取固定的文件的方法实现
  }

  async getSearchResults(query: string): Promise<string> {
    // ... 获取搜索结果的方法实现
  }

  async getProblems(filepath?: string | undefined): Promise<Problem[]> {
    // ... 获取问题的方法实现
  }

  async subprocess(command: string): Promise<[string, string]> {
    // ... 子进程执行命令的方法实现
  }

  async getBranch(dir: string): Promise<string> {
    // ... 获取分支的方法实现
  }

  getGitRootPath(dir: string): Promise<string | undefined> {
    // ... 获取 Git 根路径的方法实现
  }

  async listDir(dir: string): Promise<[string, FileType][]> {
    // ... 列出目录内容的方法实现
  }

  getIdeSettings(): IdeSettings {
    // ... 获取 IDE 设置的方法实现
  }
}

export { VsCodeIde };
