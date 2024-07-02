import {
  ArrowLeftIcon,
  ChatBubbleOvalLeftIcon,
  CodeBracketSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { JSONContent } from "@tiptap/react";
import { InputModifiers } from "core";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  defaultBorderRadius,
  lightGray,
  vscBackground,
  vscForeground,
} from "../components";
import { ftl } from "../components/dialogs/FTCDialog";
import StepContainer from "../components/gui/StepContainer";
import TimelineItem from "../components/gui/TimelineItem";
import ContinueInputBox from "../components/mainInput/ContinueInputBox";
import { defaultInputModifiers } from "../components/mainInput/inputModifiers";
import { IdeMessengerContext } from "../context/IdeMessenger";
import useChatHandler from "../hooks/useChatHandler";
import useHistory from "../hooks/useHistory";
import { useWebviewListener } from "../hooks/useWebviewListener";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import {
  clearLastResponse,
  newSession,
  setInactive,
} from "../redux/slices/stateSlice";
import {
  setDialogEntryOn,
  setDialogMessage,
  setShowDialog,
} from "../redux/slices/uiStateSlice";
import { RootState } from "../redux/store";
import {
  getFontSize,
  getMetaKeyLabel,
  isJetBrains,
  isMetaEquivalentKeyPressed,
} from "../util";
import { getLocalStorage, setLocalStorage } from "../util/localStorage";

// 顶部 GUI 容器样式
const TopGuiDiv = styled.div`
  overflow-y: scroll;

  scrollbar-width: none; /* Firefox */

  /* 隐藏 Chrome, Safari 和 Opera 的滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }

  height: 100%;
`;

// 停止按钮样式
const StopButton = styled.div`
  width: fit-content;
  margin-right: auto;
  margin-left: auto;

  font-size: ${getFontSize() - 2}px;

  border: 0.5px solid ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 4px 8px;
  color: ${lightGray};

  cursor: pointer;
`;

// 步骤容器样式
const StepsDiv = styled.div`
  position: relative;
  background-color: transparent;

  & > * {
    position: relative;
  }
`;

// 新会话按钮样式
const NewSessionButton = styled.div`
  width: fit-content;
  margin-right: auto;
  margin-left: 8px;
  margin-top: 4px;

  font-size: ${getFontSize() - 2}px;

  border-radius: ${defaultBorderRadius};
  padding: 2px 6px;
  color: ${lightGray};

  &:hover {
    background-color: ${lightGray}33;
    color: ${vscForeground};
  }

  cursor: pointer;
`;

// 错误边界的回退渲染函数
function fallbackRender({ error, resetErrorBoundary }) {
  // 调用 resetErrorBoundary() 来重置错误边界并重试渲染。

  return (
    <div
      role="alert"
      className="px-2"
      style={{ backgroundColor: vscBackground }}
    >
      <p>出了点问题：</p>
      <pre style={{ color: "red" }}>{error.message}</pre>

      <div className="text-center">
        <Button onClick={resetErrorBoundary}>重新启动</Button>
      </div>
    </div>
  );
}

// GUI 组件的属性接口定义
interface GUIProps {
  firstObservation?: any;
}

// GUI 组件定义
function GUI(props: GUIProps) {
  // #region Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);
  // #endregion

  // #region Selectors
  const sessionState = useSelector((state: RootState) => state.state);
  const defaultModel = useSelector(defaultModelSelector);
  const active = useSelector((state: RootState) => state.state.active);
  // #endregion

  // #region State
  const [stepsOpen, setStepsOpen] = useState<(boolean | undefined)[]>([]);

  // #endregion

  const mainTextInputRef = useRef<HTMLInputElement>(null);
  const topGuiDivRef = useRef<HTMLDivElement>(null);

  // #region Effects
  const [userScrolledAwayFromBottom, setUserScrolledAwayFromBottom] =
    useState<boolean>(false);

  const state = useSelector((state: RootState) => state.state);

  useEffect(() => {
    const handleScroll = () => {
      // 仅当用户在窗口底部 200 像素范围内时滚动。
      const edgeOffset = -25;
      const scrollPosition = topGuiDivRef.current?.scrollTop || 0;
      const scrollHeight = topGuiDivRef.current?.scrollHeight || 0;
      const clientHeight = window.innerHeight || 0;

      if (scrollPosition + clientHeight + edgeOffset >= scrollHeight) {
        setUserScrolledAwayFromBottom(false);
      } else {
        setUserScrolledAwayFromBottom(true);
      }
    };

    topGuiDivRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [topGuiDivRef.current]);

  useLayoutEffect(() => {
    if (userScrolledAwayFromBottom) return;

    topGuiDivRef.current?.scrollTo({
      top: topGuiDivRef.current?.scrollHeight,
      behavior: "instant" as any,
    });
  }, [topGuiDivRef.current?.scrollHeight, sessionState.history]);

  useEffect(() => {
    // Cmd + Backspace 删除当前步骤
    const listener = (e: any) => {
      if (
        e.key === "Backspace" &&
        isMetaEquivalentKeyPressed(e) &&
        !e.shiftKey
      ) {
        dispatch(setInactive());
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [active]);
  // #endregion

  const { streamResponse } = useChatHandler(dispatch, ideMessenger);

  const sendInput = useCallback(
    (editorState: JSONContent, modifiers: InputModifiers) => {
      if (defaultModel?.provider === "free-trial") {
        const u = getLocalStorage("ftc");
        if (u) {
          setLocalStorage("ftc", u + 1);

          if (u >= ftl()) {
            navigate("/onboarding");
            return;
          }
        } else {
          setLocalStorage("ftc", 1);
        }
      }

      streamResponse(editorState, modifiers, ideMessenger);

      // 增加弹出窗口的 localstorage 计数器
      const currentCount = getLocalStorage("mainTextEntryCounter");
      if (currentCount) {
        setLocalStorage("mainTextEntryCounter", currentCount + 1);
        if (currentCount === 300) {
          dispatch(
            setDialogMessage(
              <div className="text-center p-4">
                👋 感谢使用
                iCoding。我们一直在努力改进，并且喜欢听取用户的意见。如果您有兴趣与我们交流，请输入您的姓名和电子邮件。我们不会将这些信息用于除联系您之外的其他用途。
                <br />
                <br />
                <form
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    dispatch(
                      setDialogMessage(
                        <div className="text-center p-4">
                          谢谢！我们会尽快与您联系。
                        </div>,
                      ),
                    );
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <input
                    style={{ padding: "10px", borderRadius: "5px" }}
                    type="text"
                    name="name"
                    placeholder="姓名"
                    required
                  />
                  <input
                    style={{ padding: "10px", borderRadius: "5px" }}
                    type="email"
                    name="email"
                    placeholder="电子邮件"
                    required
                  />
                  <button
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    type="submit"
                  >
                    提交
                  </button>
                </form>
              </div>,
            ),
          );
          dispatch(setDialogEntryOn(false));
          dispatch(setShowDialog(true));
        }
      } else {
        setLocalStorage("mainTextEntryCounter", 1);
      }
    },
    [
      sessionState.history,
      sessionState.contextItems,
      defaultModel,
      state,
      streamResponse,
    ],
  );

  const { saveSession, getLastSessionId, loadLastSession } =
    useHistory(dispatch);

  useWebviewListener(
    "newSession",
    async () => {
      saveSession();
      mainTextInputRef.current?.focus?.();
    },
    [saveSession],
  );

  const isLastUserInput = useCallback(
    (index: number): boolean => {
      let foundLaterUserInput = false;
      for (let i = index + 1; i < state.history.length; i++) {
        if (state.history[i].message.role === "user") {
          foundLaterUserInput = true;
          break;
        }
      }
      return !foundLaterUserInput;
    },
    [state.history],
  );

  return (
    <>
      <TopGuiDiv ref={topGuiDivRef}>
        <div className="max-w-3xl m-auto">
          <StepsDiv>
            {state.history.map((item, index: number) => {
              return (
                <Fragment key={index}>
                  <ErrorBoundary
                    FallbackComponent={fallbackRender}
                    onReset={() => {
                      dispatch(newSession());
                    }}
                  >
                    {item.message.role === "user" ? (
                      <ContinueInputBox
                        onEnter={async (editorState, modifiers) => {
                          streamResponse(
                            editorState,
                            modifiers,
                            ideMessenger,
                            index,
                          );
                        }}
                        isLastUserInput={isLastUserInput(index)}
                        isMainInput={false}
                        editorState={item.editorState}
                        contextItems={item.contextItems}
                      ></ContinueInputBox>
                    ) : (
                      <TimelineItem
                        item={item}
                        iconElement={
                          false ? (
                            <CodeBracketSquareIcon width="16px" height="16px" />
                          ) : false ? (
                            <ExclamationTriangleIcon
                              width="16px"
                              height="16px"
                              color="red"
                            />
                          ) : (
                            <ChatBubbleOvalLeftIcon
                              width="16px"
                              height="16px"
                            />
                          )
                        }
                        open={
                          typeof stepsOpen[index] === "undefined"
                            ? false
                              ? false
                              : true
                            : stepsOpen[index]!
                        }
                        onToggle={() => {}}
                      >
                        <StepContainer
                          index={index}
                          isLast={index === sessionState.history.length - 1}
                          isFirst={index === 0}
                          open={
                            typeof stepsOpen[index] === "undefined"
                              ? true
                              : stepsOpen[index]!
                          }
                          key={index}
                          onUserInput={(input: string) => {}}
                          item={item}
                          onReverse={() => {}}
                          onRetry={() => {
                            streamResponse(
                              state.history[index - 1].editorState,
                              state.history[index - 1].modifiers ??
                                defaultInputModifiers,
                              ideMessenger,
                              index - 1,
                            );
                          }}
                          onContinueGeneration={() => {
                            window.postMessage(
                              {
                                messageType: "userInput",
                                data: {
                                  input: "继续你刚才的回应从你上次的地方开始:",
                                },
                              },
                              "*",
                            );
                          }}
                          onDelete={() => {}}
                        />
                      </TimelineItem>
                    )}
                  </ErrorBoundary>
                </Fragment>
              );
            })}
          </StepsDiv>

          <ContinueInputBox
            onEnter={(editorContent, modifiers) => {
              sendInput(editorContent, modifiers);
            }}
            isLastUserInput={false}
            isMainInput={true}
            hidden={active}
          ></ContinueInputBox>

          {active ? (
            <>
              <br />
              <br />
            </>
          ) : state.history.length > 0 ? (
            <NewSessionButton
              onClick={() => {
                saveSession();
              }}
              className="mr-auto"
            >
              新会话 ({getMetaKeyLabel()} {isJetBrains() ? "J" : "L"})
            </NewSessionButton>
          ) : getLastSessionId() ? (
            <NewSessionButton
              onClick={async () => {
                loadLastSession();
              }}
              className="mr-auto flex items-center gap-1"
            >
              <ArrowLeftIcon width="11px" height="11px" />
              上次会话
            </NewSessionButton>
          ) : null}
        </div>
      </TopGuiDiv>
      {active && (
        <StopButton
          className="mt-auto"
          onClick={() => {
            dispatch(setInactive());
            if (
              state.history[state.history.length - 1]?.message.content
                .length === 0
            ) {
              dispatch(clearLastResponse());
            }
          }}
        >
          {getMetaKeyLabel()} ⌫ 取消
        </StopButton>
      )}
    </>
  );
}

export default GUI;
