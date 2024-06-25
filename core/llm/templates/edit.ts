import { ChatMessage, PromptTemplate } from "../../index.js";

const simplifiedEditPrompt = `考虑以下代码：
\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`
编辑代码以完美满足以下用户请求：
{{{userInput}}}
除了代码之外什么都不要输出。不要输出代码块、英文解释、起始/结束标签。`;

const simplestEditPrompt = `这是编辑前的代码：
\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`

这是请求的编辑内容：
"{{{userInput}}}"

这是编辑后的代码：`;

const gptEditPrompt: PromptTemplate = (_, otherData) => {
  if (otherData?.codeToEdit?.trim().length === 0) {
    return `\
\`\`\`${otherData.language}
${otherData.prefix}[空白]${otherData.codeToEdit}${otherData.suffix}
\`\`\`

鉴于用户的请求："${otherData.userInput}"

这是应该填充在[空白]部分的代码：`;
  }

  const paragraphs = [
    "用户请求重写文件中的一段代码。",
  ];
  if (otherData.prefix?.trim().length > 0) {
    paragraphs.push(`这是文件的前缀：
\`\`\`${otherData.language}
${otherData.prefix}
\`\`\``);
  }

  if (otherData.suffix?.trim().length > 0) {
    paragraphs.push(`这是文件的后缀：
\`\`\`${otherData.language}
${otherData.suffix}
\`\`\``);
  }

  paragraphs.push(`这是要重写的代码：
\`\`\`${otherData.language}
${otherData.codeToEdit}
\`\`\`

用户的请求是："${otherData.userInput}"

这是重写后的代码：`);

  return paragraphs.join("\n\n");
};

const codellamaInfillEditPrompt = "{{filePrefix}}<填充>{{fileSuffix}}";

const START_TAG = "<从这里开始编辑>";
const osModelsEditPrompt: PromptTemplate = (history, otherData) => {
  // "无后缀"意味着没有后缀或是
  // 在函数末尾或其他地方的干净分隔
  // （我们试图避免的是语言模型尝试完成函数的闭合括号等）
  const firstCharOfFirstLine = otherData.suffix?.split("\n")[0]?.[0]?.trim();
  const isSuffix =
    otherData.suffix?.trim() !== "" &&
    // 首行第一个字符是空白
    // 否则我们假设这是一个干净的分隔
    !firstCharOfFirstLine;
  const suffixTag = isSuffix ? "<停止编辑这里>" : "";
  const suffixExplanation = isSuffix
    ? ' 当你到达"<停止编辑这里>"时，结束你的响应。'
    : "";

  // 如果既不支持预填充也不支持/v1/completions，我们必须使用不向模型灌输任何内容的聊天提示
  if (
    otherData.supportsCompletions !== "true" &&
    otherData.supportsPrefill !== "true"
  ) {
    return gptEditPrompt(history, otherData);
  }

  // 当既没有前缀也没有后缀时，使用不同的提示
  if (otherData.prefix?.trim() === "" && otherData.suffix?.trim() === "") {
    return [
      {
        role: "user",
        content: `\`\`\`${otherData.language}
${otherData.codeToEdit}
${suffixTag}
\`\`\`

请重写上面的整个代码块以满足以下请求："${otherData.userInput}"。${suffixExplanation}`,
      },
      {
        role: "assistant",
        content: `当然！这是整个重写后的代码块：
\`\`\`${otherData.language}
`,
      },
    ];
  }

  return [
    {
      role: "user",
      content: `\`\`\`${otherData.language}
${otherData.prefix}${START_TAG}
${otherData.codeToEdit}
${suffixTag}
\`\`\`

请重写上面的整个代码块，编辑"${START_TAG}"以下的部分以满足以下请求："${otherData.userInput}"。${suffixExplanation}
`,
    },
    {
      role: "assistant",
      content: `当然！这是整个代码块，包括重写的部分：
\`\`\`${otherData.language}
${otherData.prefix}${START_TAG}
`,
    },
  ];
};

const mistralEditPrompt = `[INST] 你是一位有帮助的代码助手。你的任务是根据以下指示重写代码："{{{userInput}}}"
\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`

只重写代码，不要进行解释：[/INST]
\`\`\`{{{language}}}`;

const alpacaEditPrompt = `以下是描述任务的指令，与提供进一步上下文的输入配对。写一个合适完成请求的响应。

### 指令：重写代码以满足此请求："{{{userInput}}}"

### 输入：

\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`

### 响应：

当然！这是你请求的代码：
\`\`\`{{{language}}}
`;

const phindEditPrompt = `### 系统提示
你是一位专家程序员，第一次尝试就能写出没有错误或填充的代码。

### 用户消息：
重写代码以满足此请求："{{{userInput}}}"

\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`

### 助手：
当然！这是你请求的代码：

\`\`\`{{{language}}}
`;

const deepseekEditPrompt = `### 系统提示
你是一位AI编程助手，使用由DeepSeek公司开发的DeepSeek Coder模型，你只回答与计算机科学相关的问题。对于政治敏感问题、安全和隐私问题及其他非计算机科学问题，你将拒绝回答。
### 指令：
重写代码以满足此请求："{{{userInput}}}"

\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`<|EOT|>
### 响应：
当然！这是你请求的代码：

\`\`\`{{{language}}}
`;

const zephyrEditPrompt = `<|system|>
你是一位专家程序员，第一次尝试就能写出没有错误或填充的代码。</s>
<|user|>
重写代码以满足此请求："{{{userInput}}}"

\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`</s>
<|assistant|>
当然！这是你请求的代码：

\`\`\`{{{language}}}
`;

const openchatEditPrompt = `GPT4 修正用户：你是一位专家程序员和个人助手。你被要求重写以下代码以满足{{{userInput}}}。
\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`
请仅以代码回应并将其放入markdown代码块中。不要给出任何解释，但你的代码应完美满足用户请求。<|end_of_turn|>GPT4 修正助手：当然！这是你请求的重写代码：
\`\`\`{{{language}}}
`;

const xWinCoderEditPrompt = `<system>: 你是一位帮助人们编程的AI助手。写一个合适完成用户请求的响应。
<user>: 请根据这些指示重写以下代码："{{{userInput}}}"
\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`

只重写代码，不要进行解释：
<AI>:
\`\`\`{{{language}}}`;

const neuralChatEditPrompt = `### 系统：
你是一位专家程序员，第一次尝试就能写出没有错误或填充的代码。
### 用户：
重写代码以满足此请求："{{{userInput}}}"

\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`
### 助手：
当然！这是你请求的代码：

\`\`\`{{{language}}}
`;

const codeLlama70bEditPrompt = `<s>来源：系统\n\n 你是一位专家程序员，第一次尝试就能写出没有错误或填充的代码。 <step> 来源：用户\n\n 重写代码以满足此请求："{{{userInput}}}"

\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\` <step> 来源：助手\n目的地：用户\n\n `;

const claudeEditPrompt: PromptTemplate = (
  history: ChatMessage[],
  otherData: Record<string, string>,
) => [
    {
      role: "user",
      content: `\
\`\`\`${otherData.language}
${otherData.codeToEdit}
\`\`\`

你是一位专家程序员。你将重写上述代码以执行以下操作：

${otherData.userInput}

仅输出包含重写代码的代码块：
`,
    },
    {
      role: "assistant",
      content: `当然！这是重写的代码：
\`\`\`${otherData.language}`,
    },
  ];

const llama3EditPrompt: PromptTemplate = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>
\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`

重写上述代码以满足此请求："{{{userInput}}}"<|eot_id|><|start_header_id|>assistant<|end_header_id|>
当然！这是你请求的代码：
\`\`\`{{{language}}}`;

const gemmaEditPrompt = `<start_of_turn>user
你是一位专家程序员，第一次尝试就能写出没有错误或填充的代码。重写代码以满足此请求："{{{userInput}}}"

\`\`\`{{{language}}}
{{{codeToEdit}}}
\`\`\`<end_of_turn>
<start_of_turn>model
当然！这是你请求的代码：

\`\`\`{{{language}}}
`;
// todo:
export {
  alpacaEditPrompt,
  claudeEditPrompt,
  codeLlama70bEditPrompt,
  codellamaInfillEditPrompt,
  deepseekEditPrompt,
  gemmaEditPrompt,
  gptEditPrompt,
  llama3EditPrompt,
  mistralEditPrompt,
  neuralChatEditPrompt,
  openchatEditPrompt,
  osModelsEditPrompt,
  phindEditPrompt,
  simplestEditPrompt,
  simplifiedEditPrompt,
  xWinCoderEditPrompt,
  zephyrEditPrompt
};

