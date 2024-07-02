"""
_________               _____ _____                       
__  ____/______ _______ __  /____(_)_______ ____  _______ 
_  /     _  __ \__  __ \_  __/__  / __  __ \_  / / /_  _ \ 
/ /___   / /_/ /_  / / // /_  _  /  _  / / // /_/ / /  __/
/____/   \____/ /_/ /_/ \__/  /_/   /_/ /_/ \__,_/  \___/ 

欢迎使用iCoding！这是一个2分钟教程。

你可以点击灰色按钮，从“高亮函数”开始，跟随教程进行操作。
"""

# region —————————————————————————— 第1部分: 提问代码相关问题 [Cmd+L] ——————————————————————————


"""步骤1：高亮下面的函数"""


def mysterious_function(x):
    for i in range(len(x)):
        for j in range(len(x) - 1):
            if x[j] > x[j + 1]:
                x[j], x[j + 1] = x[j + 1], x[j]

    return x


"""步骤2：使用键盘快捷键[Cmd+L]
选择代码并切换iCoding输入框"""

"""步骤3：提问并按下回车键"""

# endregion

# region ————————————————————————————————— 第2部分: 编辑代码 [Cmd+I] —————————————————————————————————


"""步骤1：高亮这段代码"""


def mysterious_function(x):
    n = len(x)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if x[j] > x[j + 1]:
                x[j], x[j + 1] = x[j + 1], x[j]
                swapped = True
        if swapped == False:
            break
    return x


"""步骤2：使用键盘快捷键[Cmd+I]进行编辑"""

"""步骤3：输入“<你的编辑请求>”并按下回车键"""

"""步骤4：使用键盘快捷键
接受[Cmd+Shift+Enter]或拒绝[Cmd+Shift+Backspace]编辑"""

# endregion

# region ———————————————————————————— 第3部分: 自动调试 [Cmd+Shift+R] ————————————————————————————


"""步骤1：运行这个Python文件（它应该会报错！）"""


def print_sum(list_to_print):
    print(sum(list_to_print))


"""步骤2：使用键盘快捷键[Cmd+Shift+R]
自动调试错误"""
print_sum(["a", "b", "c"])

# endregion

# 准备了解更多吗？请查阅iCoding文档：https://ic0ding.netlify.app/
