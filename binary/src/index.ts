process.env.IS_BINARY = "true";
import { Command } from "commander";
import { Core } from "core/core";
import { FromCoreProtocol, ToCoreProtocol } from "core/protocol";
import { IMessenger } from "core/util/messenger";
import { getCoreLogsPath } from "core/util/paths";
import fs from "node:fs";
import { IpcIde } from "./IpcIde";
import { IpcMessenger } from "./IpcMessenger";
import { TcpMessenger } from "./TcpMessenger";
import { setupCoreLogging } from "./logging";

const logFilePath = getCoreLogsPath();
fs.appendFileSync(logFilePath, "[info] 启动 Continue core 服务...\n");

const program = new Command();

program.action(async () => {
  try {
    setupCoreLogging();
    let messenger: IMessenger<ToCoreProtocol, FromCoreProtocol>;
    if (process.env.CONTINUE_DEVELOPMENT === "true") { // 如果是开发则使用通过使用 TCP 通信
      console.log('使用 TCP socket 通信');
      messenger = new TcpMessenger<ToCoreProtocol, FromCoreProtocol>();
      console.log("等待连接");
      await (
        messenger as TcpMessenger<ToCoreProtocol, FromCoreProtocol>
      ).awaitConnection();
      console.log("已连接");
    } else {
      console.log('使用 IPC 进程间通信');
      messenger = new IpcMessenger<ToCoreProtocol, FromCoreProtocol>();
    }
    const ide = new IpcIde(messenger);
    const core = new Core(messenger, ide);
  } catch (e) {
    fs.writeFileSync("./error.log", `${new Date().toISOString()} ${e}\n`);
    console.log("Error: ", e);
    process.exit(1);
  }
});

program.parse(process.argv);