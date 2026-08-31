export interface PersonaData {
  key: string;
  title: string;
  tagline: string;
  scenario: string;
  features: { label: string; desc: string }[];
  flow: string;
}

export const PERSONAS: PersonaData[] = [
  {
    key: "learner",
    title: "B 站学习者",
    tagline: "边看边掌握",
    scenario:
      "你关注的 UP 主更新了一个小时的 Python 教程，讲了装饰器、闭包、生成器。看到第三章回头，已经记不清前面讲了什么。",
    features: [
      { label: "时间戳跳转", desc: "点「闭包」直接跳到视频 8:25" },
      {
        label: "40 分钟变 8 章节",
        desc: "视频自动拆分章节，每个知识点标时间戳",
      },
      { label: "热门视频秒开", desc: "播放量 5000+ 的总结全站共享" },
      { label: "无字幕也能总结", desc: "自动 ASR 转写后再提炼" },
    ],
    flow: "看 30 分钟教程 → 生成总结 → 点「模型训练」跳到 12:30 → 导出笔记",
  },
  {
    key: "creator",
    title: "内容创作者",
    tagline: "把 B 站视频变成创作提纲",
    scenario:
      "你刚看了一个 40 分钟的行业分析视频，想写小红书笔记。信息量大，手动整理至少半小时。",
    features: [
      { label: "结构化提纲", desc: "输出小红书图文、短视频脚本大纲" },
      { label: "双格式导出", desc: "Markdown + 脑图 PNG" },
      { label: "双链路覆盖", desc: "有字幕直接解析，无字幕自动 ASR" },
      { label: "导出即用", desc: "复制到编辑器直接排版发布" },
    ],
    flow: "手动：看视频→暂停→打字→排版，半小时。插件：看视频→总结→导出→发布，几分钟。",
  },
];
