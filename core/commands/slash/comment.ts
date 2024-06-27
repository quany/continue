import { SlashCommand } from "../../index.js";
import EditSlashCommand from "./edit.js";

const CommentSlashCommand: SlashCommand = {
  name: "comment",
  description: "为高亮代码写注释",
  run: async function* (sdk) {
    for await (const update of EditSlashCommand.run({
      ...sdk,
      input:
        "为这段代码写注释。不要更改代码本身。",
    })) {
      yield update;
    }
  },
};

export default CommentSlashCommand;
