import { IndexingProgressUpdate } from "core";
import { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { StyledTooltip, lightGray, vscForeground } from ".."; // 确保这里的路径与项目结构相匹配
import { IdeMessengerContext } from "../../context/IdeMessenger"; // 确保这里的路径与项目结构相匹配
import { getFontSize } from "../../util"; // 确保这里的路径与项目结构相匹配

const DIAMETER = 6;
const CircleDiv = styled.div<{ color: string }>`
  background-color: ${(props) => props.color};
  box-shadow: 0px 0px 2px 1px ${(props) => props.color};
  width: ${DIAMETER}px;
  height: ${DIAMETER}px;
  border-radius: ${DIAMETER / 2}px;
`;

const ProgressBarWrapper = styled.div`
  width: 100px;
  height: 6px;
  border-radius: 6px;
  border: 0.5px solid ${lightGray};
  margin-top: 6px;
`;

const ProgressBarFill = styled.div<{ completed: number; color?: string }>`
  height: 100%;
  background-color: ${(props) => props.color || vscForeground};
  border-radius: inherit;
  transition: width 0.2s ease-in-out;
  width: ${(props) => props.completed}%;
`;

const GridDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  align-items: center;
  justify-items: center;
  margin-left: 8px;
`;

const P = styled.p`
  margin: 0;
  margin-top: 2px;
  font-size: ${getFontSize() - 2.5}px;
  color: ${lightGray};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface ProgressBarProps {
  indexingState?: IndexingProgressUpdate;
}

const IndexingProgressBar = ({
  indexingState: indexingStateProp,
}: ProgressBarProps) => {
  // 如果侧边栏在扩展启动之前打开，则定义一个默认的indexingState
  const defaultIndexingState: IndexingProgressUpdate = {
    status: "loading",
    progress: 0,
    desc: "",
  };
  const indexingState = indexingStateProp || defaultIndexingState;

  // 如果侧边栏在扩展初始化后打开，则检索保存的状态。
  let initialized = false;
  useEffect(() => {
    if (!initialized) {
      // 触发检索可能在IndexingProgressBar初始化之前设置的非默认状态
      ideMessenger.post("index/indexingProgressBarInitialized", undefined);
      initialized = true;
    }
  }, []);

  const fillPercentage = Math.min(
    100,
    Math.max(0, indexingState.progress * 100),
  );

  const ideMessenger = useContext(IdeMessengerContext);

  const tooltipPortalDiv = document.getElementById("tooltip-portal-div");

  const [paused, setPaused] = useState<boolean | undefined>(undefined);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (paused === undefined) return;
    ideMessenger.post("index/setPaused", paused);
  }, [paused]);

  return (
    <div
      onClick={() => {
        if (
          indexingState.status !== "failed" &&
          indexingState.progress < 1 &&
          indexingState.progress >= 0
        ) {
          setPaused((prev) => !prev);
        } else {
          ideMessenger.post("index/forceReIndex", undefined);
        }
      }}
      className="cursor-pointer"
    >
      {indexingState.status === "loading" ? ( // 冰蓝色 '索引加载中' 点
        <>
          <CircleDiv
            data-tooltip-id="indexingNotLoaded_dot"
            color="#72aec2"
          ></CircleDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="indexingNotLoaded_dot" place="top">
                继续正在初始化
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : indexingState.status === "failed" ? ( // 红色 '失败' 点
        <>
          <CircleDiv
            data-tooltip-id="indexingFailed_dot"
            color="#ff0000"
          ></CircleDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="indexingFailed_dot" place="top">
                索引代码库错误：{indexingState.desc}
                <br />
                点击重试
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : indexingState.status === "done" ? ( // 索引完成绿色点
        <>
          <CircleDiv data-tooltip-id="progress_dot" color="#090"></CircleDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="progress_dot" place="top">
                索引已更新。点击强制重新索引
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : indexingState.status === "disabled" ? ( // 灰色禁用点
        <>
          <CircleDiv
            data-tooltip-id="progress_dot"
            color={lightGray}
          ></CircleDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="progress_dot" place="top">
                {indexingState.desc}
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : indexingState.status === "paused" ||
        (paused && indexingState.status === "indexing") ? (
        // 黄色 '已暂停' 点
        <>
          <CircleDiv
            data-tooltip-id="progress_dot"
            color="#bb0"
            onClick={(e) => {
              ideMessenger.post("index/setPaused", false);
            }}
          ></CircleDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="progress_dot" place="top">
                点击继续索引 ({Math.trunc(indexingState.progress * 100)}%)
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : indexingState.status === "indexing" ? ( // 进度条
        <>
          <GridDiv
            data-tooltip-id="usage_progress_bar"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => {
              ideMessenger.post("index/setPaused", true);
            }}
          >
            <ProgressBarWrapper>
              <ProgressBarFill completed={fillPercentage} />
            </ProgressBarWrapper>
            <P>
              {hovered
                ? "点击暂停"
                : `索引中 (${Math.trunc(indexingState.progress * 100)}%)`}
            </P>
          </GridDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="usage_progress_bar" place="top">
                {indexingState.desc}
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : null}
    </div>
  );
};

export default IndexingProgressBar;
