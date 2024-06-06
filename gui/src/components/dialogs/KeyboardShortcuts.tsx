import ReactDOM from "react-dom";
import styled from "styled-components";
import {
  StyledTooltip,
  defaultBorderRadius,
  lightGray,
  vscForeground,
} from ".."; // 这里应该是你的项目中定义样式的路径
import { getPlatform } from "../../util"; // 这里应该是你的项目中获取平台信息的路径

const GridDiv = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 2rem;
  padding: 1rem;
  justify-items: center;
  align-items: center;

  border-top: 0.5px solid ${lightGray};
`;

const StyledKeyDiv = styled.div`
  border: 0.5px solid ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 4px;
  color: ${vscForeground};

  width: 16px;
  height: 16px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const keyToName = {
  "⌘": "Cmd",
  "⌃": "Ctrl",
  "⇧": "Shift",
  "⏎": "Enter",
  "⌫": "Backspace",
  "⌥": "Option",
  "⎇": "Alt",
};

function KeyDiv({ text }: { text: string }) {
  const tooltipPortalDiv = document.getElementById("tooltip-portal-div");

  return (
    <>
      <StyledKeyDiv data-tooltip-id={`header_button_${text}`}>
        {text}
      </StyledKeyDiv>
      {tooltipPortalDiv &&
        ReactDOM.createPortal(
          <StyledTooltip id={`header_button_${text}`} place="bottom">
            {keyToName[text]}
          </StyledTooltip>,
          tooltipPortalDiv,
        )}
    </>
  );
}

interface KeyboardShortcutProps {
  mac: string;
  windows: string;
  description: string;
}

function KeyboardShortcut(props: KeyboardShortcutProps) {
  const shortcut = getPlatform() === "mac" ? props.mac : props.windows;
  return (
    <div className="flex justify-between w-full items-center">
      <span
        style={{
          color: vscForeground,
        }}
      >
        {props.description}
      </span>
      <div className="flex gap-2 float-right">
        {shortcut.split(" ").map((key, i) => {
          return <KeyDiv key={i} text={key}></KeyDiv>;
        })}
      </div>
    </div>
  );
}

// 以下是键盘快捷键的示例数据，具体内容根据实际需要进行调整
const vscodeShortcuts: KeyboardShortcutProps[] = [
  // ... 快捷键列表
];

const jetbrainsShortcuts: KeyboardShortcutProps[] = [
  // ... 快捷键列表
];

function KeyboardShortcutsDialog() {
  return (
    <div className="p-2">
      <h3 className="my-3 mx-auto text-center">键盘快捷键</h3>
      <GridDiv>
        {(localStorage.getItem("ide") === "jetbrains"
          ? jetbrainsShortcuts
          : vscodeShortcuts
        ).map((shortcut, i) => {
          return (
            <KeyboardShortcut
              key={i}
              mac={shortcut.mac}
              windows={shortcut.windows}
              description={shortcut.description}
            />
          );
        })}
      </GridDiv>
    </div>
  );
}

export default KeyboardShortcutsDialog;
