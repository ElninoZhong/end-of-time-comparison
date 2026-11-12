# 时间的尽头

用同一条提示词，让三个模型各自用 Three.js 制作可玩的 3D 网页。[进入作品对照与试玩](https://elninozhong.github.io/end-of-time-comparison/)

| 创作模型 | 创作环境 | 试玩 | 可以比较什么 |
| --- | --- | --- | --- |
| GPT-6-Astra · High | Codex | [终潮观测站](https://elninozhong.github.io/end-of-time-comparison/versions/tide/index.html) | 拖动海面的视角，在第二章让潮汐倒流，第三章凝住时间，接住一束光。 |
| GPT-6.1-Sol · High | Codex | [破碎宇宙时钟](https://elninozhong.github.io/end-of-time-comparison/versions/clock/index.html) | 绕到断环背面，点击带光芒的漂流物拾取记忆。拖动时间滑块，观察星尘改变流向。 |
| Gemini 4 Argon · High | Antigravity | [天文钟 · Finis Temporis](https://elninozhong.github.io/end-of-time-comparison/versions/horologium/index.html) | 切换四个纪元，聚焦一座晶碑，再触发引力脉冲，观察星轨和仪表怎样响应。 |

## 原始提示词

> 请使用Three.js创作一个主题为《时间的尽头》的3D交互式网页。
>
> 充分发挥你最顶级的审美、艺术设计和3D编程能力，在构图、光影、材质、粒子、动画和空间氛围上做到极致。画面需要有令人震撼的视觉表现力，并且可以通过鼠标自由交互。不限制你的创意和技术方案，尽可能展示你的能力上限。请直接完成开发、运行和测试，交付一个真正可玩的作品。

## 如何理解这些作品

三份作品均取自 2026 年 11 月 11 日下午的创作记录，使用相同的首条提示词和 High 推理设置。两个 GPT 版本在 Codex 中创作，Gemini 版本在 Antigravity 中创作。后续对话和调试过程各有不同。 这里展示的是每个版本的具体画面与可玩的操作。首页预览来自浏览器实拍。打开一个作品后，可用顶部菜单切换；“独立打开”会在新标签页运行原版网页。

## 本地运行

克隆仓库，在根目录执行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

用支持 WebGL 2 的浏览器访问 <http://127.0.0.1:8000/>。页面与渲染库均随仓库提供。破碎宇宙时钟的字体优先使用 Google Fonts，请求失败时会使用系统字体。

[GPT-6-Astra 版本源码](versions/tide/) · [GPT-6.1-Sol 版本源码](versions/clock/) · [Gemini 4 Argon 版本源码](versions/horologium/)

各版本随附其使用的 Three.js 许可证。仓库保留原作的操作方式与视觉设计，发布整理仅涉及静态资源路径、依赖文件和外层比较页。
