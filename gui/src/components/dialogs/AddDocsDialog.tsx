import { usePostHog } from "posthog-js/react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Button, Input } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { SubmenuContextProvidersContext } from "../../context/SubmenuContextProviders";
import { setShowDialog } from "../../redux/slices/uiStateSlice";

const GridDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
  align-items: center;
`;

function AddDocsDialog() {
  const [docsUrl, setDocsUrl] = useState("");
  const [docsTitle, setDocsTitle] = useState("");
  const [urlValid, setUrlValid] = useState(false);
  const dispatch = useDispatch();

  const ideMessenger = useContext(IdeMessengerContext);
  const { addItem } = useContext(SubmenuContextProvidersContext);

  const ref = React.useRef<HTMLInputElement>(null);
  const posthog = usePostHog();

  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
      }
    }, 100);
  }, []);

  return (
    <div className="p-4">
      <h3>添加文档</h3>

      <p>
        继续预索引许多常见文档网站，但如果在下拉列表中没有看到您需要的，可以在这里输入URL。继续的索引引擎将爬取网站并生成嵌入，以便您可以提问。
      </p>

      <Input
        type="url"
        placeholder="URL"
        value={docsUrl}
        ref={ref}
        onChange={(e) => {
          setDocsUrl(e.target.value);
          setUrlValid(e.target.validity.valid);
        }}
      />
      <Input
        type="text"
        placeholder="标题"
        value={docsTitle}
        onChange={(e) => setDocsTitle(e.target.value)}
      />

      <Button
        disabled={!docsUrl || !urlValid}
        className="ml-auto"
        onClick={() => {
          ideMessenger.post("context/addDocs", {
            url: docsUrl,
            title: docsTitle,
          });
          setDocsTitle("");
          setDocsUrl("");
          dispatch(setShowDialog(false));
          addItem("docs", {
            id: docsUrl,
            title: docsTitle,
            description: new URL(docsUrl).hostname,
          });
          posthog.capture("add_docs", { url: docsUrl });
        }}
      >
        完成
      </Button>
    </div>
  );
}

export default AddDocsDialog;
