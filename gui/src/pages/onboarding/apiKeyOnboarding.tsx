import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import QuickModelSetup from "../../components/modelSelection/quickSetup/QuickModelSetup";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { getLocalStorage } from "../../util/localStorage";

function ApiKeyOnboarding() {
  const ideMessenger = useContext(IdeMessengerContext);
  const navigate = useNavigate();
  return (
    <div className="p-2 max-w-96 mt-16 mx-auto">
      <h1 className="text-center">模型设置</h1>
      <p className="text-center">
        要开始，请选择一个模型并输入您的API密钥。您可以随时通过点击{" "}
        <Cog6ToothIcon
          className="inline-block h-5 w-5 align-middle cursor-pointer"
          onClick={() => ideMessenger.post("openConfigJson", undefined)}
        />{" "}
        图标在右下角重新配置。
      </p>

      <QuickModelSetup
        onDone={() => {
          ideMessenger.post("showTutorial", undefined);

          if (getLocalStorage("signedInToGh") === true) {
            navigate("/");
          } else {
            navigate("/apiKeyAutocompleteOnboarding");
          }
        }}
      ></QuickModelSetup>
    </div>
  );
}

export default ApiKeyOnboarding;
