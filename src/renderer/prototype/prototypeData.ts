export type AppView = "work" | "browser" | "library" | "settings";
export type AuthorizationPolicy = "inherit" | "full" | "ask" | "read" | "strict";
export type TaskKind = "collection" | "article" | "download" | "write" | "takeover";
export type TaskState = "success" | "running" | "partial" | "waiting" | "failed" | "not-submitted";
export type ArtifactSet = "xhs-notes" | "shop-products" | "article" | "download-files" | "write-preview";

export type PrototypeRun = {
  id: string;
  label: string;
  stateLabel: string;
  summary: string;
};

export type PrototypeTask = {
  id: string;
  title: string;
  skill: string;
  site: string;
  identity: string;
  identityId: string;
  source: "App" | "CLI" | "MCP" | "API" | "SDK" | "Agent";
  state: TaskState;
  stateLabel: string;
  updatedAt: string;
  summary: string;
  kind: TaskKind;
  authorization?: string;
  runs?: PrototypeRun[];
  artifactSet?: ArtifactSet;
  artifactState?: "ready" | "pending" | "none";
  artifactTotal?: number;
  artifactCurrent?: number;
};

export type Identity = {
  id: string;
  name: string;
  site: string;
  account: string;
  provider: string;
  state: "available" | "running" | "login" | "repair";
  stateLabel: string;
  detail: string;
  region?: string;
  language?: string;
  timezone?: string;
  proxy?: string;
  startPage?: string;
  tags?: string[];
  fingerprint?: string;
  userAgent?: string;
  screen?: string;
  loginState?: "logged-in" | "login-required" | "unknown";
  sessionState?: "idle" | "running" | "failed";
  controller?: string;
  currentPage?: string;
  lastHealthyAt?: string;
};

export const authorizationPolicyLabels: Record<AuthorizationPolicy, string> = {
  inherit: "继承上一级设置",
  full: "完全访问",
  ask: "写入批准",
  read: "只读",
  strict: "每一步都要批准",
};

export type Skill = {
  id: string;
  name: string;
  site: string;
  tags: string[];
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  output: string;
  availability: "available" | "unavailable";
};

export const tasks: PrototypeTask[] = [
  {
    id: "xhs-notes",
    title: "小红书 AI 工具笔记采集",
    skill: "搜索并读取笔记",
    site: "小红书",
    identity: "小红书运营号 A",
    identityId: "xhs-a",
    source: "App",
    state: "success",
    stateLabel: "已完成 · 12 条",
    updatedAt: "今天 14:32",
    summary: "已按关键词“AI 工具”采集 12 条笔记，内容与作者信息可直接查看。",
    kind: "collection",
    artifactSet: "xhs-notes",
    artifactState: "ready",
    artifactTotal: 12,
    runs: [
      { id: "run-01", label: "首次采集", stateLabel: "已完成 · 8 条", summary: "首次运行读取 8 条笔记，随后按相同输入再次执行。" },
      { id: "run-02", label: "再次采集", stateLabel: "已完成 · 12 条", summary: "本次运行读取 12 条笔记并更新结构化结果。" },
    ],
  },
  {
    id: "wechat-article",
    title: "读取产品周报",
    skill: "公众号文章阅读",
    site: "微信公众号",
    identity: "品牌内容号",
    identityId: "wechat-brand",
    source: "MCP",
    state: "success",
    stateLabel: "已完成",
    updatedAt: "今天 13:18",
    summary: "文章正文已读取，可以在 App 内直接阅读并回到来源页面。",
    kind: "article",
    artifactSet: "article",
    artifactState: "ready",
  },
  {
    id: "douyin-download",
    title: "下载活动视频素材",
    skill: "公开视频下载",
    site: "抖音",
    identity: "内容研究号",
    identityId: "douyin-lab",
    source: "CLI",
    state: "partial",
    stateLabel: "部分完成 · 3/4",
    updatedAt: "今天 12:46",
    summary: "3 个文件已保存，1 个文件因来源失效未完成，可单独重试。",
    kind: "download",
    artifactSet: "download-files",
    artifactState: "ready",
  },
  {
    id: "xhs-draft",
    title: "准备新品体验笔记",
    skill: "发布笔记",
    site: "小红书",
    identity: "小红书运营号 A",
    identityId: "xhs-a",
    source: "Agent",
    state: "not-submitted",
    stateLabel: "未提交",
    updatedAt: "今天 11:20",
    summary: "标题、正文和 4 个话题已填入页面并校验，尚未点击发布。",
    kind: "write",
    artifactSet: "write-preview",
    artifactState: "ready",
  },
  {
    id: "xhs-login",
    title: "读取收藏夹中的竞品笔记",
    skill: "收藏夹浏览",
    site: "小红书",
    identity: "竞品研究号",
    identityId: "research",
    source: "API",
    state: "waiting",
    stateLabel: "需要你完成登录",
    updatedAt: "10 分钟前",
    summary: "账号登录状态已过期。任务已暂停，登录完成并校验成功后会继续。",
    kind: "takeover",
    artifactState: "none",
  },
  {
    id: "shop-running",
    title: "同步店铺上新商品",
    skill: "商品列表采集",
    site: "淘宝",
    identity: "店铺观察号",
    identityId: "shop-observer",
    source: "SDK",
    state: "running",
    stateLabel: "正在读取 · 36/80",
    updatedAt: "刚刚",
    summary: "正在读取商品标题、价格和库存状态，已产生可用的部分结果。",
    kind: "collection",
    artifactSet: "shop-products",
    artifactState: "ready",
    artifactTotal: 80,
    artifactCurrent: 36,
    runs: [
      { id: "run-01", label: "昨日同步", stateLabel: "已完成 · 64 条", summary: "昨日同步已完成，结果仍可查看。" },
      { id: "run-02", label: "本次同步", stateLabel: "正在读取 · 36/80", summary: "本次运行正在读取新增商品。" },
    ],
  },
];

export const identities: Identity[] = [
  {
    id: "xhs-a",
    name: "小红书运营号 A",
    site: "小红书",
    account: "品牌内容",
    provider: "官方 Chrome",
    state: "running",
    stateLabel: "运行中",
    detail: "实例由任务使用 · 小红书发现页",
    tags: ["内容运营", "品牌号"],
    fingerprint: "Chrome 默认指纹 · WebGL 自动",
    userAgent: "Chrome 126 · macOS",
    screen: "1512 × 982 · 2x",
    loginState: "logged-in",
    sessionState: "running",
    controller: "任务占用",
    currentPage: "小红书发现页",
    lastHealthyAt: "刚刚",
  },
  {
    id: "research",
    name: "竞品研究号",
    site: "小红书",
    account: "研究组",
    provider: "官方 Chrome",
    state: "login",
    stateLabel: "需要登录",
    detail: "登录状态已过期 · 18 分钟前确认",
    loginState: "login-required",
    sessionState: "idle",
    controller: "空闲",
    lastHealthyAt: "18 分钟前",
  },
  {
    id: "wechat-brand",
    name: "品牌内容号",
    site: "微信公众号",
    account: "内容团队",
    provider: "官方 Chrome",
    state: "available",
    stateLabel: "可用",
    detail: "空闲 · 今天 13:18 使用",
    loginState: "logged-in",
    sessionState: "idle",
    controller: "空闲",
    lastHealthyAt: "今天 13:18",
  },
  {
    id: "douyin-lab",
    name: "内容研究号",
    site: "抖音",
    account: "素材组",
    provider: "CloakBrowser",
    state: "repair",
    stateLabel: "需要修复",
    detail: "CloakBrowser 未安装",
    tags: ["素材研究", "抖音"],
    fingerprint: "独立种子 · WebGL/Canvas 隔离",
    userAgent: "Chrome 126 · macOS",
    screen: "1440 × 900 · 2x",
    loginState: "unknown",
    sessionState: "failed",
    controller: "空闲",
    lastHealthyAt: "尚未验证",
  },
];

export const skills: Skill[] = [
  {
    id: "xhs-search",
    name: "搜索并读取笔记",
    site: "小红书",
    tags: ["数据采集", "内容浏览"],
    description: "按关键词搜索笔记，读取标题、作者、互动数据和正文。",
    inputLabel: "搜索关键词",
    inputPlaceholder: "例如：AI 工具",
    output: "笔记列表、内容详情、作者与互动数据",
    availability: "available",
  },
  {
    id: "xhs-publish",
    name: "发布笔记",
    site: "小红书",
    tags: ["内容发布"],
    description: "填写标题、正文、图片与话题，并按授权策略决定是否提交。",
    inputLabel: "笔记标题",
    inputPlaceholder: "输入本次发布的标题",
    output: "提交状态与页面结果",
    availability: "available",
  },
  {
    id: "wechat-read",
    name: "公众号文章阅读",
    site: "微信公众号",
    tags: ["内容浏览", "数据采集"],
    description: "读取指定公众号文章，保留正文结构、图片与来源信息。",
    inputLabel: "文章链接",
    inputPlaceholder: "粘贴 mp.weixin.qq.com 文章链接",
    output: "可阅读文章、作者、发布时间与图片",
    availability: "available",
  },
  {
    id: "douyin-download",
    name: "公开视频下载",
    site: "抖音",
    tags: ["内容下载"],
    description: "保存指定公开视频及其基础描述，逐个显示文件结果。",
    inputLabel: "视频链接",
    inputPlaceholder: "粘贴一个或多个公开视频链接",
    output: "视频文件、文件名、大小与保存位置",
    availability: "available",
  },
  {
    id: "taobao-products",
    name: "商品列表采集",
    site: "淘宝",
    tags: ["数据采集"],
    description: "读取店铺商品列表中的标题、价格、库存和详情链接。",
    inputLabel: "店铺链接",
    inputPlaceholder: "粘贴目标店铺首页链接",
    output: "结构化商品列表",
    availability: "available",
  },
  {
    id: "boss-jobs",
    name: "职位搜索与详情读取",
    site: "BOSS 直聘",
    tags: ["数据采集", "内容浏览"],
    description: "目标站点当前访问条件不稳定，暂不允许创建生产任务。",
    inputLabel: "职位关键词",
    inputPlaceholder: "暂不可用",
    output: "职位列表与详情",
    availability: "unavailable",
  },
];

export const resultRows = [
  ["让 AI 自动整理资料的 5 个方法", "一只产品汪", "2,481", "今天 14:28"],
  ["我用了一周的本地 AI 工作台", "数字生活家", "1,906", "今天 14:26"],
  ["AI 工具怎么选：先看这三个场景", "小北效率论", "1,284", "今天 14:21"],
  ["从资料收集到内容发布的自动化", "运营手记", "986", "今天 14:16"],
  ["普通人也能搭好的 AI 信息流", "小林同学", "735", "今天 14:12"],
];

export const productRows = [
  ["便携补光灯", "¥129", "有货", "今天 14:31"],
  ["无线领夹麦克风", "¥239", "有货", "今天 14:29"],
  ["桌面直播支架", "¥89", "补货中", "今天 14:27"],
];
