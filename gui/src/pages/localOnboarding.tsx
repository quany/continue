import { CheckIcon, PlayIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  StyledTooltip,
  defaultBorderRadius,
  lightGray,
  vscButtonBackground,
  vscButtonForeground,
  vscForeground,
} from "../components";
import { IdeMessengerContext } from "../context/IdeMessenger";

const ModelPillDiv = styled.div<{ selected: boolean }>`
  padding: 4px 4px;
  border-radius: ${defaultBorderRadius};
  border: 0.5px solid ${lightGray};
  background-color: ${({ selected }) =>
    selected ? vscButtonBackground : "transparent"};
  color: ${({ selected }) => (selected ? vscButtonForeground : vscForeground)};
  cursor: pointer;
  transition: background-color 0.1s ease-out;

  text-align: center;
  align-items: center;

  &:hover {
    color: ${vscButtonForeground};
    background-color: ${vscButtonBackground};
  }
`;

function CheckMarkHeader(props: { children: string; complete: boolean }) {
  return (
    <div className="flex gap-4 items-center">
      {props.complete ? (
        <CheckCircleIconSolid
          width="24px"
          height="24px"
          color="#0b0"
          className="flex-none"
        ></CheckCircleIconSolid>
      ) : (
        <div
          className="flex-none border border-solid rounded-full w-5 h-5 mt-1"
          style={{ borderColor: lightGray }}
        ></div>
      )}
      <h3>{props.children}</h3>
    </div>
  );
}

const RunInTerminalDiv = styled.div<{ clicked: boolean }>`
  padding-left: 8px;
  padding-right: 8px;
  display: flex;
  border-radius: ${defaultBorderRadius};
  width: fit-content;
  gap: 8px;

  ${({ clicked }) => clicked && "background-color: #0f02;"}

  align-items: center;

  border: 1px solid ${lightGray};

  cursor: pointer;
  &:hover {
    background-color: ${({ clicked }) => (clicked ? "#0f02" : "#fff1")};
  }
`;

function RunInTerminalButton(props: { command: string }) {
  const [clicked, setClicked] = useState(false);

  const id = `info-hover-${encodeURIComponent(props.command)}`;
  const tooltipPortalDiv = document.getElementById("tooltip-portal-div");

  const ideMessenger = useContext(IdeMessengerContext);

  return (
    <>
      <div
        className="flex items-center justify-center mt-8"
        data-tooltip-id={id}
      >
        <RunInTerminalDiv
          clicked={clicked}
          style={{ border: `0.5px solid ${lightGray}` }}
          className="grid-cols-2"
          onClick={() => {
            ideMessenger.ide.runCommand(props.command);
            setClicked(true);
            setTimeout(() => setClicked(false), 2000);
            ideMessenger.post("copyText", { text: props.command });
          }}
        >
          <pre>
            <code
              style={{
                color: vscForeground,
                backgroundColor: "transparent",
              }}
            >
              {props.command}
            </code>
          </pre>
          {clicked ? (
            <CheckIcon
              width="20px"
              height="20px"
              className="cursor-pointer hover:bg-white"
              color="#0b0"
            />
          ) : (
            <PlayIcon
              width="20px"
              height="20px"
              className="cursor-pointer hover:bg-white"
            />
          )}
        </RunInTerminalDiv>
      </div>
      {tooltipPortalDiv &&
        ReactDOM.createPortal(
          <StyledTooltip id={id} place="top">
            在终端中运行
          </StyledTooltip>,
          tooltipPortalDiv,
        )}
    </>
  );
}

// 假设的 "Ollama" 标题来源于 core/config/onboarding.ts
const assumedModelTitle = "Ollama";
const recommendedChatModel = "llama3";
const recommendedAutocompleteModel = "starcoder2:3b";

function LocalOnboarding() {
  const navigate = useNavigate();

  const [stage1Done, setStage1Done] = useState(false);
  const [stage2Done, setStage2Done] = useState(false);
  const [stage3Done, setStage3Done] = useState(false);

  const [ollamaModels, setOllamaModels] = useState<string[] | undefined>(
    undefined,
  );
  const [ollamaConnectionStatus, setOllamaConnectionStatus] = useState<
    "waitingToDownload" | "downloading" | "verified"
  >("waitingToDownload");

  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    undefined,
  );

  const ideMessenger = useContext(IdeMessengerContext);

  useEffect(() => {
    if (ollamaModels?.some((model) => model.startsWith(recommendedChatModel))) {
      setStage2Done(true);

      // 向服务器发送空请求以加载模型
      ideMessenger.post("llm/complete", {
        completionOptions: {},
        prompt: "",
        title: assumedModelTitle,
      });
    }
  }, [ollamaModels]);

  useEffect(() => {
    if (
      ollamaModels?.some((model) =>
        model.startsWith(recommendedAutocompleteModel),
      )
    ) {
      setStage3Done(true);
    }
  }, [ollamaModels]);

  useEffect(() => {
    const checkModels = async () => {
      const models = await ideMessenger.request("llm/listModels", {
        title: assumedModelTitle,
      });
      if (Array.isArray(models)) {
        setOllamaConnectionStatus("verified");
        setStage1Done(true);
        setOllamaModels(models);
      }
    };
    checkModels();
    const interval = setInterval(checkModels, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [ollamaConnectionStatus]);

  return (
    <div className="p-8 overflow-y-scroll">
      <h1 className="text-center">设置您的本地大型语言模型</h1>
      <CheckMarkHeader complete={stage1Done}>1. 下载 Ollama</CheckMarkHeader>
      {ollamaConnectionStatus === "verified" || (
        <>
          <p>
            点击下方链接从 https://ollama.ai 下载
            Ollama。下载完成后，您只需要启动应用程序。
          </p>
          <div className="text-center">
            <a href="https://ollama.ai">
              <Button onClick={() => setOllamaConnectionStatus("downloading")}>
                下载 Ollama
              </Button>
            </a>
          </div>
        </>
      )}
      {ollamaConnectionStatus === "downloading" && (
        <p>正在检查与 Ollama 的连接...</p>
      )}
      {ollamaConnectionStatus === "verified" && <p>Ollama 已连接！</p>}
      <br></br>
      <CheckMarkHeader complete={stage2Done}>
        2. 下载用于聊天的模型
      </CheckMarkHeader>
      {stage1Done && (
        <>
          我们推荐使用由 Meta 训练的最新开源模型 Llama 3。
          <br></br>
          <RunInTerminalButton
            command={`ollama run ${recommendedChatModel}`}
          ></RunInTerminalButton>
        </>
      )}
      <br></br>
      <CheckMarkHeader complete={stage3Done}>
        3. 下载用于标签自动完成的模型
      </CheckMarkHeader>
      {stage1Done && (
        <>
          我们推荐使用由 Hugging Face 训练的最先进的 3b 参数自动完成模型
          Starcoder 2。
          <br></br>
          <RunInTerminalButton
            command={`ollama run ${recommendedAutocompleteModel}`}
          ></RunInTerminalButton>
        </>
      )}
      {/* 其余代码保持不变 */}
    </div>
  );
}

export default LocalOnboarding;
