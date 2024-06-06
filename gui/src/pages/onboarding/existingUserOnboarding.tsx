import { TRIAL_FIM_MODEL } from "core/config/onboarding";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { greenButtonColor } from "../../components";
import StyledMarkdownPreview from "../../components/markdown/StyledMarkdownPreview";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { setLocalStorage } from "../../util/localStorage";
import { Div, StyledButton } from "./components";

const TopDiv = styled.div`
  overflow-y: scroll;

  scrollbar-width: none; /* Firefox */

  /* 隐藏Chrome, Safari和Opera的滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }

  height: 100%;
`;

function ExistingUserOnboarding() {
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);

  const [hovered1, setHovered1] = useState(false);
  const [hovered2, setHovered2] = useState(false);

  const [selected, setSelected] = useState(-1);

  return (
    <TopDiv>
      <div className="m-auto p-2 max-w-96 mt-16 overflow-y-scroll">
        <h1 className="text-center">使用改进的模型？</h1>
        <p className="text-center pb-2">
          Continue现在集成了更高质量的云模型用于自动补全和代码库检索。
        </p>
        <Div
          color={greenButtonColor}
          disabled={false}
          selected={selected === 0}
          hovered={hovered1}
          onClick={() => {
            setSelected(0);
          }}
          onMouseEnter={() => setHovered1(true)}
          onMouseLeave={() => setHovered1(false)}
        >
          <h3>🔒 保持现有设置</h3>
          <p>继续使用完全本地的自动补全和嵌入，或任何您已配置的选项。</p>
        </Div>
        <br></br>
        <Div
          color={"#be841b"}
          disabled={false}
          selected={selected === 1}
          hovered={hovered2}
          onClick={() => {
            setSelected(1);
          }}
          onMouseEnter={() => setHovered2(true)}
          onMouseLeave={() => setHovered2(false)}
        >
          <h3>✨ 使用云模型</h3>
          <p>
            Continue的自动补全和代码库检索将显著改善。API调用将发送至Fireworks/Voyage，但代码只会存储在本地。
          </p>
        </Div>
        {selected === 1 && (
          <>
            <StyledMarkdownPreview
              source={`以下内容将写入 \`config.json\`:
\`\`\`json
{
  // Fireworks AI上的Starcoder 7b
  "tabAutocompleteModel": {
    "title": "Tab Autocomplete",
    "provider": "free-trial",
    "model": "${TRIAL_FIM_MODEL}"
  },
  // Voyage AI的voyage-code-2
  "embeddingsProvider": {
    "provider": "free-trial"
  },
  // Voyage AI的rerank-lite-1
  "reranker": {
    "name": "free-trial"
  }
}
\`\`\`

或者，您可以输入自己的API密钥:
\`\`\`json
{
  "tabAutocompleteModel": {
    "title": "Codestral",
    "provider": "mistral",
    "model": "codestral-latest",
    "apiKey": "MISTRAL_API_KEY"
  }
  "embeddingsProvider": {
    "provider": "openai",
    "model": "voyage-code-2",
    "apiBase": "https://api.voyageai.com/v1",
    "apiKey": "VOYAGE_API_KEY"
  },
  "reranker": {
    "name": "voyage",
    "params": {
      "apiKey": "VOYAGE_API_KEY"
    }
  }
}
\`\`\``}
            ></StyledMarkdownPreview>
          </>
        )}
        <br />
        <div className="flex">
          <StyledButton
            disabled={selected < 0}
            onClick={() => {
              ideMessenger.post("completeOnboarding", {
                mode: ["localExistingUser", "optimizedExistingUser"][
                  selected
                ] as any,
              });
              ideMessenger.post("openConfigJson", undefined);
              setLocalStorage("onboardingComplete", true);
              ideMessenger.post("index/forceReIndex", undefined);
              navigate("/");
            }}
          >
            继续
          </StyledButton>
        </div>
      </div>
    </TopDiv>
  );
}

export default ExistingUserOnboarding;
