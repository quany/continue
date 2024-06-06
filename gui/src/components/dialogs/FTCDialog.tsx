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

export const ftl = () => {
  const ftc = parseInt(localStorage.getItem("ftc"));
  if (ftc && ftc > 52) {
    return 100;
  } else if (ftc && ftc > 27) {
    return 50;
  }
  return 25;
};

function FTCDialog() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = React.useState("");
  const dispatch = useDispatch();
  const ideMessenger = useContext(IdeMessengerContext);

  return (
    <div className="p-4">
      <h3>免费试用限制已达到</h3>
      <p>
        您已达到{ftl()}
        次免费输入的免费试用限制。要继续使用Continue，您可以使用自己的API密钥，或使用本地大语言模型。要了解更多选项，请查看我们的
        <a href="https://docs.continue.dev/setup/overview" target="_blank">
          文档
        </a>
        。
      </p>

      <Input
        type="text"
        placeholder="输入您的OpenAI API密钥"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <GridDiv>
        <Button
          onClick={() => {
            dispatch(setShowDialog(false));
            navigate("/models");
          }}
        >
          选择模型
        </Button>
        <Button
          disabled={!apiKey}
          onClick={() => {
            ideMessenger.post("config/addOpenAiKey", apiKey);
            dispatch(setShowDialog(false));
            dispatch(setDefaultModel({ title: "GPT-4" }));
          }}
        >
          使用我的API密钥
        </Button>
      </GridDiv>
    </div>
  );
}

export default FTCDialog;
