import { useState } from "react";
import { useFormContext } from "react-hook-form";
import styled from "styled-components";
import { Input, Label, Select, defaultBorderRadius, lightGray } from "..";
import { getFontSize } from "../../util";

const Div = styled.div<{ dashed: boolean }>`
  border: 1px ${(props) => (props.dashed ? "dashed" : "solid")} ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 8px;
  margin-bottom: 16px;
`;

type ModelOption = "apiKey" | "model" | "contextLength";

const DefaultModelOptions: {
  [key: string]: { [key in ModelOption]?: string };
} = {
  OpenAI: {
    apiKey: "",
    model: "gpt-4",
  },
  OpenAIFreeTrial: {
    apiKey: "",
    model: "gpt-4",
  },
  Anthropic: {
    apiKey: "",
    model: "claude-2",
  },
  default: {
    apiKey: "",
    model: "gpt-4",
  },
};

function ModelSettings(props: { llm: any | undefined; role: string }) {
  const [modelOptions, setModelOptions] = useState<{
    [key in ModelOption]?: string;
  }>(DefaultModelOptions[props.llm?.class_name || "default"]);

  const { register, setValue, getValues } = useFormContext();

  return (
    <Div dashed={typeof props.llm === undefined}>
      {props.llm ? (
        <>
          <b>{props.role}</b>: <b> {props.llm?.class_name || "gpt-4"}</b>
          <form>
            {typeof modelOptions.apiKey !== undefined && (
              <>
                <Label fontSize={getFontSize()}>API密钥</Label>
                <Input
                  type="text"
                  defaultValue={props.llm.apiKey}
                  placeholder="API密钥"
                  {...register(`models.${props.role}.apiKey`)}
                />
              </>
            )}
            {modelOptions.model && (
              <>
                <Label fontSize={getFontSize()}>模型</Label>
                <Input
                  type="text"
                  defaultValue={props.llm.model}
                  placeholder="模型"
                  {...register(`models.${props.role}.model`)}
                />
              </>
            )}
          </form>
        </>
      ) : (
        <div>
          <b>添加模型</b>
          <div className="my-4">
            <Select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  e.target.value = "";
                }
              }}
            >
              <option disabled value="">
                选择模型类型
              </option>
              <option value="newModel1">新模型 1</option>
              <option value="newModel2">新模型 2</option>
              <option value="newModel3">新模型 3</option>
            </Select>
          </div>
        </div>
      )}
    </Div>
  );
}

export default ModelSettings;
