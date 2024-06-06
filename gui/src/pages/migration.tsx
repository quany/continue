import { useNavigate } from "react-router-dom";
import ContinueButton from "../components/mainInput/ContinueButton";

function MigrationPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1>
        迁移到 <code>config.json</code>
      </h1>

      <p>
        Continue 现在使用一个 .json 配置文件。我们希望这能消除设置过程中的猜测。
      </p>

      <p>
        您的配置应该已经自动迁移，但我们建议再次检查以确保一切看起来都是正确的。
      </p>

      <p>
        有关变更摘要和 <code>config.json</code> 的示例，请参见{" "}
        <a href="https://docs.continue.dev/walkthroughs/config-file-migration">
          迁移教程
        </a>
        ，如果您有任何问题，请通过{" "}
        <a href="https://discord.gg/Y83xkG3uUW">Discord</a>与我们联系。
      </p>

      <i>注意：如果您手动运行服务器并且没有更新服务器，此消息不适用。</i>

      <ContinueButton
        showStop={false}
        onClick={() => {
          navigate("/");
        }}
        disabled={false}
      />
    </div>
  );
}

export default MigrationPage;
