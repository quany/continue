# 欢迎使用 VS Code 扩展

## 文件夹中的内容

* 此文件夹包含扩展所需的所有文件。
* 'package.json' - 这是您在其中声明扩展和命令的清单文件。
  * 示例插件注册一个命令并定义其标题和命令名称。有了这些信息，VS Code 可以在命令面板中显示命令。它还不需要加载插件。
* 'src/extension.ts' - 这是您将在其中提供命令实现的主文件。
  * 该文件导出一个函数“activate”，该函数在首次激活扩展时调用（在本例中通过执行命令）。在“activate”函数中，我们称之为“registerCommand”。
  * 我们将包含命令实现的函数作为第二个参数传递给 'registerCommand'。

## 立即启动并运行

* 按“F5”打开一个新窗口，并加载您的扩展程序。
* 按（在 Mac 上为“Ctrl+Shift+P”或“Cmd+Shift+P”）并键入“Hello World”，从命令面板运行命令。
* 在代码中的“src/extension.ts”中设置断点以调试扩展。
* 在调试控制台中查找扩展的输出。

## 进行更改

* 您可以在更改 'src/extension.ts' 中的代码后从调试工具栏重新启动扩展。
* 您还可以使用扩展重新加载（在 Mac 上为 Ctrl+R“或”Cmd+R“）VS Code 窗口以加载更改。

## 探索 API

* 当您打开文件“node_modules/@types/vscode/index.d.ts”时，您可以打开我们的全套 API。

## 运行测试

* 打开调试 viewlet（在 Mac 上为“Ctrl+Shift+D”或“Cmd+Shift+D”），然后从启动配置下拉列表中选择“扩展测试”。
* 按“F5”在加载扩展的新窗口中运行测试。
* 在调试控制台中查看测试结果的输出。
* 更改 'src/test/suite/extension.test.ts' 或在 'test/suite' 文件夹中创建新的测试文件。
  * 提供的测试运行程序将仅考虑与名称模式“**.test.ts”匹配的文件。
  * 您可以在“test”文件夹中创建文件夹，以任何您想要的方式构建您的测试。

## 走得更远

* [遵循 UX 指南]（https://code.visualstudio.com/api/ux-guidelines/overview） 创建与 VS Code 的本机界面和模式无缝集成的扩展。
 * 通过[捆绑扩展]（https://code.visualstudio.com/api/working-with-extensions/bundling-extension）来减小扩展大小并缩短启动时间。
 * [发布扩展]（https://code.visualstudio.com/api/working-with-extensions/publishing-extension） 在 VS Code 扩展市场。
 * 通过设置 [持续集成]（https://code.visualstudio.com/api/working-with-extensions/continuous-integration） 自动构建。
# 欢迎使用 VS Code 扩展

## 文件夹中的内容

* 此文件夹包含扩展所需的所有文件。
* 'package.json' - 这是您在其中声明扩展和命令的清单文件。
  * 示例插件注册一个命令并定义其标题和命令名称。有了这些信息，VS Code 可以在命令面板中显示命令。它还不需要加载插件。
* 'src/extension.ts' - 这是您将在其中提供命令实现的主文件。
  * 该文件导出一个函数“activate”，该函数在首次激活扩展时调用（在本例中通过执行命令）。在“activate”函数中，我们称之为“registerCommand”。
  * 我们将包含命令实现的函数作为第二个参数传递给 'registerCommand'。
## 立即启动并运行

* 按“F5”打开一个新窗口，并加载您的扩展程序。
* 按（在 Mac 上为“Ctrl+Shift+P”或“Cmd+Shift+P”）并键入“Hello World”，从命令面板运行命令。
* 在代码中的“src/extension.ts”中设置断点以调试扩展。
* 在调试控制台中查找扩展的输出。

## 进行更改

* 您可以在更改 'src/extension.ts' 中的代码后从调试工具栏重新启动扩展。
* 您还可以使用扩展重新加载（在 Mac 上为 Ctrl+R“或”Cmd+R“）VS Code 窗口以加载更改。

## 探索 API

* 当您打开文件“node_modules/@types/vscode/index.d.ts”时，您可以打开我们的全套 API。

## 运行测试

* 打开调试 viewlet（在 Mac 上为“Ctrl+Shift+D”或“Cmd+Shift+D”），然后从启动配置下拉列表中选择“扩展测试”。
* 按“F5”在加载扩展的新窗口中运行测试。
* 在调试控制台中查看测试结果的输出。
* 更改 'src/test/suite/extension.test.ts' 或在 'test/suite' 文件夹中创建新的测试文件。
  * 提供的测试运行程序只会有缺点