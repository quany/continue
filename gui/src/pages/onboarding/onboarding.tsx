import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { greenButtonColor } from "../../components";
import { ftl } from "../../components/dialogs/FTCDialog";
import GitHubSignInButton from "../../components/modelSelection/quickSetup/GitHubSignInButton";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { isJetBrains } from "../../util";
import { getLocalStorage, setLocalStorage } from "../../util/localStorage";
import { Div, StyledButton } from "./components";

function Onboarding() {
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);

  const [hovered0, setHovered0] = useState(false);
  const [hovered1, setHovered1] = useState(false);

  const [selected, setSelected] = useState(-1);

  return (
    <div className="p-2 max-w-96 mt-16 mx-auto">
      {getLocalStorage("ftc") > ftl() ? (
        <>
          <h1 className="text-center">免费试用次数已达上限</h1>
          <p className="text-center pb-2">
            要继续使用Continue，请输入API密钥或设置本地模型
          </p>
        </>
      ) : (
        <>
          <h1 className="text-center">欢迎使用iCoding</h1>
          <p className="text-center pb-2">让我们找到最适合您的设置</p>
        </>
      )}

      <Div
        color={"#be841b"}
        disabled={false}
        selected={selected === 0}
        hovered={hovered0}
        onClick={() => {
          setSelected(0);
        }}
        onMouseEnter={() => setHovered0(true)}
        onMouseLeave={() => setHovered0(false)}
      >
        <h3>✨ 使用您的API密钥</h3>
        <p>
          输入一个OpenAI或其他API密钥以获得最佳体验。Continue将使用最好的商用模型来索引代码。代码只会存储在本地。
        </p>
      </Div>
      {selected === 0 && (
        <p className="px-3">
          <b>聊天:</b> 您选择的任何模型
          <br />
          <br />
          <b>嵌入:</b> Voyage Code 2
          <br />
          <br />
          <b>自动补全:</b> Starcoder 7B via Fireworks AI
        </p>
      )}
      <br></br>
      <Div
        color={greenButtonColor}
        disabled={false}
        selected={selected === 1}
        hovered={hovered1}
        onClick={() => {
          setSelected(1);
        }}
        onMouseEnter={() => setHovered1(true)}
        onMouseLeave={() => setHovered1(false)}
      >
        <h3>🔒 本地模型</h3>
        <p>
          没有代码会离开您的计算机，但使用的模型较弱。适用于Ollama，LM
          Studio等。
        </p>
      </Div>
      {selected === 1 && (
        <p className="px-3">
          <b>聊天:</b> 使用Ollama，LM Studio等的Llama 3
          <br />
          <br />
          <b>嵌入:</b> Nomic Embed
          <br />
          <br />
          <b>自动补全:</b> Starcoder2 3B
        </p>
      )}
      <br></br>
      <br />
      <div className="flex">
        <StyledButton
          blurColor={
            selected === 0
              ? "#be841b"
              : selected === 1
              ? greenButtonColor
              : "#1b84be"
          }
          disabled={selected < 0}
          onClick={() => {
            ideMessenger.post("completeOnboarding", {
              mode: ["apiKeys", "local"][selected] as any,
            });
            setLocalStorage("onboardingComplete", true);

            if (selected === 1) {
              navigate("/localOnboarding");
            } else {
              // 只有在我们从默认（本地）嵌入提供程序切换时才需要
              ideMessenger.post("index/forceReIndex", undefined);
              navigate("/apiKeyOnboarding");
            }
          }}
        >
          继续
        </StyledButton>
      </div>

      {(!getLocalStorage("onboardingComplete") || isJetBrains()) && (
        <>
          <hr className="w-full my-12"></hr>

          <p className="text-center">或使用GitHub登录以试用25次免费请求</p>
          <GitHubSignInButton
            onComplete={async (token) => {
              setLocalStorage("onboardingComplete", true);
              await ideMessenger.request("completeOnboarding", {
                mode: "freeTrial",
              });
              navigate("/");
            }}
          ></GitHubSignInButton>
        </>
      )}
    </div>
  );
}

export default Onboarding;
