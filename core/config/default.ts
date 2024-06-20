import {
  ContextProviderWithParams,
  ModelDescription,
  SerializedContinueConfig,
  SlashCommandDescription,
} from "../index.js";

export const FREE_TRIAL_MODELS: ModelDescription[] = [
  {
    title: "GPT-4o (免费试用)",
    provider: "free-trial",
    model: "gpt-4o",
    systemMessage:
      "你是一名专家级的软件开发人员。你提供有帮助且简明的回答。",
  },
  {
    title: "Llama3 70b (免费试用)",
    provider: "free-trial",
    model: "llama3-70b",
    systemMessage:
      "你是一名专家级的软件开发人员。你提供有帮助且简明的回答。每当你编写代码块时，你会在开头标记后包含语言。",
  },
  {
    title: "Codestral (免费试用)",
    provider: "free-trial",
    model: "codestral",
  },
  {
    title: "Claude 3 Sonnet (免费试用)",
    provider: "free-trial",
    model: "claude-3-sonnet-20240229",
  },
];

export const defaultConfig: SerializedContinueConfig = {
  models: FREE_TRIAL_MODELS,
  customCommands: [
    {
      name: "test",
      prompt:
        "{{{ input }}}\n\n为选中的代码编写一整套单元测试。它应包括设置、运行检查正确性的测试（包括重要的边界情况）和清理。确保测试完整且复杂。仅将测试作为聊天输出，不要编辑任何文件。",
      description: "为高亮代码编写单元测试",
    },
  ],
  tabAutocompleteModel: {
    title: "Starcoder2 3b",
    provider: "ollama",
    model: "starcoder2:3b",
  },
};

export const defaultConfigJetBrains: SerializedContinueConfig = {
  models: FREE_TRIAL_MODELS,
  customCommands: [
    {
      name: "test",
      prompt:
        "{{{ input }}}\n\n为选中的代码编写一整套单元测试。它应包括设置、运行检查正确性的测试（包括重要的边界情况）和清理。确保测试完整且复杂。仅将测试作为聊天输出，不要编辑任何文件。",
      description: "为高亮代码编写单元测试",
    },
  ],
  tabAutocompleteModel: {
    title: "Starcoder2 3b",
    provider: "ollama",
    model: "starcoder2:3b",
  },
};

export const defaultSlashCommandsVscode: SlashCommandDescription[] = [
  {
    name: "edit",
    description: "编辑选中代码",
  },
  {
    name: "comment",
    description: "为选中的代码写注释",
  },
  {
    name: "share",
    description: "将当前聊天会话导出为Markdown",
  },
  {
    name: "cmd",
    description: "生成一个Shell命令",
  },
  {
    name: "commit",
    description: "生成一个Git提交信息",
  },
];

export const defaultSlashCommandsJetBrains = [
  {
    name: "edit",
    description: "编辑选中代码",
  },
  {
    name: "comment",
    description: "为选中的代码写注释",
  },
  {
    name: "share",
    description: "将当前聊天会话导出为Markdown",
  },
  {
    name: "commit",
    description: "生成一个Git提交信息",
  },
];

export const defaultContextProvidersVsCode: ContextProviderWithParams[] = [
  { name: "code", params: {} },
  { name: "docs", params: {} },
  { name: "diff", params: {} },
  { name: "terminal", params: {} },
  { name: "problems", params: {} },
  { name: "folder", params: {} },
  { name: "codebase", params: {} },
];

export const defaultContextProvidersJetBrains: ContextProviderWithParams[] = [
  { name: "diff", params: {} },
  { name: "folder", params: {} },
  { name: "codebase", params: {} },
];
