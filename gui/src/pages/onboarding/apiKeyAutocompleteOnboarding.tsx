import { Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { ModelProvider } from "core";
import { TRIAL_FIM_MODEL } from "core/config/onboarding";
import { Fragment, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SecondaryButton } from "../../components";
import GitHubSignInButton from "../../components/modelSelection/quickSetup/GitHubSignInButton";
import {
  StyledListbox,
  StyledListboxButton,
  StyledListboxOption,
  StyledListboxOptions,
} from "../../components/modelSelection/quickSetup/StyledListbox";
import { IdeMessengerContext } from "../../context/IdeMessenger";

interface AutocompleteOption {
  provider: ModelProvider;
  title: string;
  icon?: string;
}

const AUTOCOMPLETE_PROVIDER_OPTIONS: AutocompleteOption[] = [
  {
    provider: "free-trial",
    title: "免费试用 (Codestral)",
    // icon: "fireworks.png",
  },
  {
    provider: "fireworks",
    title: "Fireworks AI",
    // icon: "fireworks.png",
  },
  {
    provider: "ollama",
    title: "Ollama",
    icon: "ollama.png",
  },
];

interface AutocompleteModelDropdownProps {
  selectedProvider: AutocompleteOption;
  setSelectedProvider: any;
}

function AutocompleteModelDropdown({
  selectedProvider,
  setSelectedProvider,
}: AutocompleteModelDropdownProps) {
  return (
    <StyledListbox value={selectedProvider} onChange={setSelectedProvider}>
      <div className="relative mt-1">
        <StyledListboxButton>
          <span className="flex items-center">
            {window.vscMediaUrl && selectedProvider.icon && (
              <img
                src={`${window.vscMediaUrl}/logos/${selectedProvider.icon}`}
                height="24px"
                style={{ marginRight: "10px" }}
              />
            )}
            <span className="text-md">{selectedProvider.title}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </StyledListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <StyledListboxOptions>
            {AUTOCOMPLETE_PROVIDER_OPTIONS.map((option, index) => (
              <StyledListboxOption
                selected={selectedProvider.title === option.title}
                key={index}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    {window.vscMediaUrl && option.icon && (
                      <img
                        src={`${window.vscMediaUrl}/logos/${option.icon}`}
                        height="24px"
                        style={{ marginRight: "10px" }}
                      />
                    )}
                    <span className="text-md">{option.title}</span>

                    {selected ? (
                      <span className="inset-y-0 ml-auto flex items-center pl-3 text-amber-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </StyledListboxOption>
            ))}
          </StyledListboxOptions>
        </Transition>
      </div>
    </StyledListbox>
  );
}

function ApiKeyAutocompleteOnboarding() {
  const ideMessenger = useContext(IdeMessengerContext);
  const navigate = useNavigate();

  const [selectedProvider, setSelectedProvider] = useState<AutocompleteOption>(
    AUTOCOMPLETE_PROVIDER_OPTIONS[0],
  );

  const [apiKeyValue, setApiKeyValue] = useState<string>("");

  return (
    <div className="p-2 max-w-96 mt-16 mx-auto">
      <h1 className="text-center">自动补全模型</h1>
      <p className="text-center">
        Tab自动补全需要一个单独的模型。目前我们支持通过GitHub登录免费使用。或者，从下拉列表中选择其他选项。
      </p>
      <br />
      <br />

      <AutocompleteModelDropdown
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
      ></AutocompleteModelDropdown>

      <br />
      <br />
      {selectedProvider.provider === "ollama" && (
        <div className="text-center">
          <Button
            onClick={() => {
              navigate("/localOnboarding");
            }}
          >
            设置Ollama
          </Button>
        </div>
      )}
      {selectedProvider.provider === "free-trial" && (
        <div className="text-center">
          <p>登录GitHub以免费试用自动补全</p>
          <GitHubSignInButton
            onComplete={async (token) => {
              await ideMessenger.request("addAutocompleteModel", {
                model: {
                  title: "自动补全试用",
                  provider: "free-trial",
                  model: TRIAL_FIM_MODEL,
                },
              });
              navigate("/");
            }}
          ></GitHubSignInButton>
        </div>
      )}
      {selectedProvider.provider === "fireworks" && (
        <div className="text-center">
          <h4>粘贴您的API密钥</h4>
          <SecondaryButton
            className="w-full border-2 border-solid"
            onClick={() => {
              ideMessenger.post("openUrl", "https://fireworks.ai/api-keys");
            }}
          >
            获取API密钥
          </SecondaryButton>
          <Input
            id="apiKey"
            className="w-full"
            placeholder="输入API密钥"
            value={apiKeyValue}
            onChange={(e) => {
              setApiKeyValue(e.target.value);
            }}
          />
          <Button
            onClick={async () => {
              await ideMessenger.request("addAutocompleteModel", {
                model: {
                  title: "Fireworks自动补全",
                  provider: "fireworks",
                  model: "starcoder-7b",
                  apiKey: apiKeyValue,
                },
              });
              navigate("/");
            }}
          >
            保存
          </Button>
        </div>
      )}
    </div>
  );
}

export default ApiKeyAutocompleteOnboarding;
