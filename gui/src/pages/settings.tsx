import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ContinueConfig } from "core";
import { useContext, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  Hr,
  NumberInput,
  TextArea,
  lightGray,
  vscBackground,
  vscForeground,
  vscInputBackground,
} from "../components";
import InfoHover from "../components/InfoHover";
import Loader from "../components/loaders/Loader";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { RootState } from "../redux/store";
import { getFontSize, getPlatform } from "../util";
import { setLocalStorage } from "../util/localStorage";

const CancelButton = styled(Button)`
  background-color: transparent;
  color: ${lightGray};
  border: 1px solid ${lightGray};
  &:hover {
    background-color: ${lightGray};
    color: black;
  }
`;

const SaveButton = styled(Button)`
  &:hover {
    opacity: 0.8;
  }
`;

const Slider = styled.input.attrs({ type: "range" })`
  --webkit-appearance: none;
  width: 100%;
  background-color: ${vscInputBackground};
  outline: none;
  border: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    cursor: pointer;
    background: ${lightGray};
    border-radius: 4px;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 8px;
    height: 8px;
    cursor: pointer;
    margin-top: -3px;
  }
  &::-moz-range-thumb {
    width: 8px;
    height: 8px;
    cursor: pointer;
    margin-top: -3px;
  }

  &:focus {
    outline: none;
    border: none;
  }
`;

const ConfigJsonButton = styled(Button)`
  padding: 2px 4px;
  margin-left: auto;
  margin-right: 4px;
  background-color: transparent;
  color: ${vscForeground};
  border: 1px solid ${lightGray};
  &:hover {
    background-color: ${lightGray};
  }
`;

const ALL_MODEL_ROLES = ["default", "summarize", "edit", "chat"];

function Settings() {
  const formMethods = useForm<ContinueConfig>();
  const onSubmit = (data: ContinueConfig) => console.log(data);

  const ideMessenger = useContext(IdeMessengerContext);

  const navigate = useNavigate();
  const config = useSelector((state: RootState) => state.state.config);
  const dispatch = useDispatch();

  const submitChanges = () => {
    // TODO
  };

  const submitAndLeave = () => {
    submitChanges();
    navigate("/");
  };

  useEffect(() => {
    if (!config) return;

    formMethods.setValue("systemMessage", config.systemMessage);
    formMethods.setValue(
      "completionOptions.temperature",
      config.completionOptions?.temperature,
    );
  }, [config]);

  return (
    <FormProvider {...formMethods}>
      <div className="overflow-y-scroll">
        <div
          className="items-center flex sticky top-0"
          style={{
            borderBottom: `0.5px solid ${lightGray}`,
            backgroundColor: vscBackground,
          }}
        >
          <ArrowLeftIcon
            width="1.2em"
            height="1.2em"
            onClick={submitAndLeave}
            className="inline-block ml-4 cursor-pointer"
          />
          <h3 className="text-lg font-bold m-2 inline-block">设置</h3>
          <ConfigJsonButton
            onClick={() => {
              ideMessenger.post("showFile", {
                filepath:
                  getPlatform() == "windows"
                    ? "~\\.continue\\config.json"
                    : "~/.continue/config.json",
              });
            }}
          >
            打开 config.json
          </ConfigJsonButton>
        </div>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {config ? (
            <div className="p-2">
              <h3 className="flex gap-1">
                系统消息
                <InfoHover
                  msg={`设置一个系统消息，包含LLM始终需要记住的信息（例如：“请给出简洁的回答。始终用西班牙语回应。”）`}
                />
              </h3>
              <TextArea
                placeholder="输入系统消息（例如：‘始终用德语回答’）"
                {...formMethods.register("systemMessage")}
              />

              <Hr />
              <h3 className="flex gap-1">
                温度
                <InfoHover
                  msg={`设置温度值在0到1之间。较高的值将使LLM更具创造力，而较低的值将使其更可预测。`}
                />
              </h3>
              <div className="flex justify-between mx-16 gap-1">
                <p>0</p>
                <Slider
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  {...formMethods.register("completionOptions.temperature")}
                />
                <p>1</p>
              </div>
              <div className="text-center" style={{ marginTop: "-25px" }}>
                <p className="text-sm text-gray-500">
                  {(formMethods.watch("completionOptions.temperature") as
                    | number
                    | undefined) ||
                    config.completionOptions?.temperature ||
                    "-"}
                </p>
              </div>
              <Hr />

              {/* 其他设置项 */}
            </div>
          ) : (
            <Loader />
          )}
        </form>

        <hr />

        <div className="px-2">
          <h3>外观</h3>

          <p>字体大小</p>
          <NumberInput
            type="number"
            min="8"
            max="48"
            step="1"
            defaultValue={getFontSize()}
            onChange={(e) => {
              setLocalStorage("fontSize", parseInt(e.target.value));
            }}
          />
        </div>

        <div className="flex gap-2 justify-end px-4">
          <CancelButton
            onClick={() => {
              navigate("/");
            }}
          >
            取消
          </CancelButton>
          <SaveButton onClick={submitAndLeave}>保存</SaveButton>
        </div>
      </div>
    </FormProvider>
  );
}

export default Settings;
