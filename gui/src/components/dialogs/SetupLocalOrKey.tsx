import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Input } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { setDefaultModel } from "../../redux/slices/stateSlice";
import { setShowDialog } from "../../redux/slices/uiStateSlice";

const GridDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
  align-items: center;
`;

function SetupLocalOrKeyDialog() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = React.useState("");
  const dispatch = useDispatch();

  const ideMessenger = useContext(IdeMessengerContext);

  return (
    <div className="p-4">
      <h3>设置您自己的模型</h3>
      <p>
        要在免费输入后继续使用 Continue，您可以使用自己的 API
        密钥，或者使用本地大语言模型。要了解更多选项，请查看我们的
        <a
          className="cursor-pointer"
          onClick={() =>
            ideMessenger.request(
              "openUrl",
              "https://docs.continue.dev/reference/Model%20Providers/freetrial",
            )
          }
        >
          文档
        </a>
        。
      </p>

      <Input
        type="text"
        placeholder="输入您的 OpenAI API 密钥"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Button
        className="w-full"
        disabled={!apiKey}
        onClick={() => {
          ideMessenger.post("config/addOpenAiKey", apiKey);
          dispatch(setShowDialog(false));
          dispatch(setDefaultModel({ title: "GPT-4" }));
        }}
      >
        使用我的 OpenAI API 密钥
      </Button>
      <div className="text-center">— 或者 —</div>
      <GridDiv>
        <Button
          onClick={() => {
            dispatch(setShowDialog(false));
            ideMessenger.request("completeOnboarding", {
              mode: "localAfterFreeTrial",
            });
            navigate("/localOnboarding");
          }}
        >
          使用本地模型
        </Button>
        <Button
          onClick={() => {
            dispatch(setShowDialog(false));
            navigate("/models");
          }}
        >
          查看所有选项
        </Button>
      </GridDiv>
    </div>
  );
}

export default SetupLocalOrKeyDialog;
