import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Input, SecondaryButton } from "../..";
import { IdeMessengerContext } from "../../../context/IdeMessenger";
import { setDefaultModel } from "../../../redux/slices/stateSlice";
import { getLocalStorage } from "../../../util/localStorage";
import { PROVIDER_INFO } from "../../../util/modelData";
import { ftl } from "../../dialogs/FTCDialog";
import QuickSetupListBox from "./QuickSetupListBox";

interface QuickModelSetupProps {
  onDone: () => void;
  hideFreeTrialLimitMessage?: boolean;
}

function QuickModelSetup(props: QuickModelSetupProps) {
  const [selectedProvider, setSelectedProvider] = useState(
    PROVIDER_INFO["openai"],
  );
  const [selectedModel, setSelectedModel] = useState(
    selectedProvider.packages[0],
  );
  const formMethods = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ideMessenger = useContext(IdeMessengerContext);

  useEffect(() => {
    setSelectedModel(selectedProvider.packages[0]);
  }, [selectedProvider]);

  const [hasAddedModel, setHasAddedModel] = useState(false);

  return (
    <FormProvider {...formMethods}>
      <div className="p-4">
        {!props.hideFreeTrialLimitMessage && getLocalStorage("ftc") > ftl() && (
          <p className="text-sm text-gray-500">
            您已达到 {ftl()} 次免费输入的免费试用限制。要继续使用
            Continue，您可以使用自己的 API
            密钥，或者使用本地大语言模型。要了解更多选项，请查看我们的
            <a
              href="https://docs.continue.dev/setup/overview"
              target="_blank"
              onClick={() =>
                ideMessenger.post(
                  "openUrl",
                  "https://docs.continue.dev/setup/overview",
                )
              }
            >
              文档
            </a>
            。
          </p>
        )}

        <h4>1. 选择一个提供商</h4>
        <QuickSetupListBox
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          options={Object.entries(PROVIDER_INFO)
            .filter(([key]) => !["freetrial", "openai-aiohttp"].includes(key))
            .map(([, provider]) => provider)}
        ></QuickSetupListBox>

        <h4>2. 选择一个模型</h4>
        <QuickSetupListBox
          selectedProvider={selectedModel}
          setSelectedProvider={setSelectedModel}
          options={
            Object.entries(PROVIDER_INFO).find(
              ([, provider]) => provider.title === selectedProvider.title,
            )?.[1].packages
          }
        ></QuickSetupListBox>

        {selectedProvider.apiKeyUrl && (
          <>
            <h4>3. 粘贴您的 API 密钥</h4>
            {selectedModel.params.model.startsWith("codestral") && (
              <i>注意：Codestral 需要与其他 Mistral 模型不同的 API 密钥</i>
            )}
            <SecondaryButton
              className="w-full border-2 border-solid"
              onClick={() => {
                let apiKeyUrl = selectedProvider.apiKeyUrl;
                if (selectedModel.params.model.startsWith("codestral")) {
                  apiKeyUrl = "https://console.mistral.ai/codestral";
                }
                ideMessenger.post("openUrl", apiKeyUrl);
              }}
            >
              获取 API 密钥
            </SecondaryButton>
            <Input
              id="apiKey"
              className="w-full"
              placeholder="输入 API 密钥"
              {...formMethods.register("apiKey", { required: true })}
            />
          </>
        )}
        {selectedProvider.downloadUrl && (
          <>
            <h4>3. 下载 {selectedProvider.title}</h4>
            <SecondaryButton
              className="w-full border-2 border-solid"
              onClick={() => {
                ideMessenger.post("openUrl", selectedProvider.downloadUrl);
              }}
            >
              下载 {selectedProvider.title}
            </SecondaryButton>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            disabled={
              selectedProvider.apiKeyUrl && !formMethods.watch("apiKey")
            }
            onClick={() => {
              const model = {
                ...selectedProvider.params,
                ...selectedModel.params,
                provider: selectedProvider.provider,
                apiKey: formMethods.watch("apiKey"),
                title: selectedModel.title,
              };
              ideMessenger.post("config/addModel", { model });
              dispatch(setDefaultModel({ title: model.title, force: true }));
              setHasAddedModel(true);
            }}
            className="w-full"
          >
            添加模型
          </Button>
          <Button
            onClick={props.onDone}
            className="w-full"
            disabled={!hasAddedModel}
          >
            完成
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}

export default QuickModelSetup;
