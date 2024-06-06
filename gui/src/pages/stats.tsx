import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { table } from "table"; // 确保引入 table 库
import { lightGray, vscBackground, vscInputBackground } from "../components";
import { CopyButton } from "../components/markdown/CopyButton";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { useNavigationListener } from "../hooks/useNavigationListener";

const Th = styled.th`
  padding: 0.5rem;
  text-align: left;
  border: 1px solid ${vscInputBackground};
`;

const Tr = styled.tr`
  &:hover {
    background-color: ${vscInputBackground};
  }

  overflow-wrap: anywhere;

  border: 1px solid ${vscInputBackground};
`;

const Td = styled.td`
  padding: 0.5rem;
  border: 1px solid ${vscInputBackground};
`;

function generateTable(data) {
  return table(data);
}

function Stats() {
  useNavigationListener();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);

  const [days, setDays] = useState([
    // 填充初始状态
  ]);
  const [models, setModels] = useState([
    // 填充初始状态
  ]);

  useEffect(() => {
    ideMessenger.request("stats/getTokensPerDay", undefined).then((days) => {
      setDays(days);
    });
  }, []);

  useEffect(() => {
    ideMessenger
      .request("stats/getTokensPerModel", undefined)
      .then((models) => {
        setModels(models);
      });
  }, []);

  return (
    <div>
      <div
        className="items-center flex m-0 p-0 sticky top-0"
        style={{
          borderBottom: `0.5px solid ${lightGray}`,
          backgroundColor: vscBackground,
        }}
      >
        <ArrowLeftIcon
          width="1.2em"
          height="1.2em"
          onClick={() => navigate("/")}
          className="inline-block ml-4 cursor-pointer"
        />
        <h3 className="text-lg font-bold m-2 inline-block">我的使用情况</h3>
      </div>

      <div className="flex gap-2 items-center">
        <h2 className="ml-2">每日使用量</h2>
        <CopyButton
          text={generateTable([
            ["日期", "生成的Token数", "提示的Token数"],
            ...days.map((day) => [
              day.day,
              day.generatedTokens,
              day.promptTokens,
            ]),
          ])}
        />
      </div>
      <table className="w-full border-collapse">
        <thead>
          <Tr>
            <Th>日期</Th>
            <Th>生成的Token数</Th>
            <Th>提示的Token数</Th>
          </Tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <Tr key={day.day}>
              <Td>{day.day}</Td>
              <Td>{day.generatedTokens}</Td>
              <Td>{day.promptTokens}</Td>
            </Tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 items-center">
        <h2 className="ml-2">每个模型的使用量</h2>
        <CopyButton
          text={generateTable([
            ["模型", "生成的Token数", "提示的Token数"],
            ...models.map((model) => [
              model.model,
              model.generatedTokens,
              model.promptTokens,
            ]),
          ])}
        />
      </div>
      <table className="w-full border-collapse">
        <thead>
          <Tr>
            <Th>模型</Th>
            <Th>生成的Token数</Th>
            <Th>提示的Token数</Th>
          </Tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <Tr key={model.model}>
              <Td>{model.model}</Td>
              <Td>{model.generatedTokens}</Td>
              <Td>{model.promptTokens}</Td>
            </Tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Stats;
