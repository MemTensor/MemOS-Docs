export default {
  header: {
    home: '首页',
    research: '研究论文',
    changelog: '更新日志',
    docs: '文档',
    openmem: '组织架构',
    menus: {
      welcome: '导览',
      cloud: '云服务',
      openSource: '开源项目',
      selfDevelopedModel: '自研模型',
      openclaw: 'OpenClaw与Hermes',
      mcpAgent: 'MCP与Agent框架支持',
      apiDocs: 'API接口文档',
      samples: '示例项目',
      changelog: '更新日志'
    },
    community: {
      button: '加入社群',
      shortLabel: '社群',
      tooltip: '扫码加入微信或 Discord 交流群',
      title: '欢迎来到开发者社区',
      wechat: '微信'
    },
    backToHome: '回到首页',
    dashboard: '控制台',
    searchPlaceholder: '搜索',
    toggleColorMode: '切换浅色 / 深色模式',
    switchLanguage: '切换语言（中文 / English）'
  },
  pageToc: {
    navLabel: '本页导航',
    onPage: '本页目录'
  },
  community: {
    title: '社区',
    stars: '在 GitHub 上点赞',
    edit: '编辑文档'
  },
  footer: {
    copyright: '© 2025 记忆张量（上海）科技有限公司 版权所有',
    product: '产品',
    memosCloud: 'MemOS 云服务',
    memoryAssistant: '个人记忆助手',
    mcpService: 'MCP服务',
    playground: 'Playground',
    githubProject: 'Github项目',
    apiDocs: '开发者文档',
    blog: '博客',
    pricing: '定价',
    aboutUs: '关于我们',
    memtensor: '记忆张量',
    openmem: 'OpenMem社区',
    community: '加入社群',
    joinUs: '岗位招聘',
    contactUs: '联系我们',
    icpFilingNumber: '沪ICP备2025129722号-3',
    filingNumber: '沪公网安备 33010002000070号',
    officialAccount: 'Memtensor 公众号',
    wechatGroup: '微信交流群'
  },
  homepage: {
    title: '别让你的 AI 再忘来忘去，用 MemOS',
    titlePrefix: '别让你的 AI 再忘来忘去，用',
    titleSuffix: '',
    description: '提供从上手入门到生产部署的一切指南，帮你最短时间集成 MemOS',
    buttonText: '写入你的第一条记忆',
    openclawButton: 'OpenClaw 配置指南',
    items: [
      {
        title: '理解记忆机制',
        description: '先看 MemOS 解决什么问题，以及记忆生产、召回和生命周期的基本链路。'
      },
      {
        title: 'MemOS 云服务',
        description: '生产级记忆服务托管平台，开箱即用，五分钟完成首次集成与调试。'
      },
      {
        title: 'MemOS 开源项目',
        description: '自托管开源记忆方案，私有部署、安全可控，支持自由定制与深度扩展。'
      },
      {
        title: '示例项目',
        description: '面向真实业务场景的实战示例，助你快速搭建可上线的长期记忆 AI 应用。'
      },
      {
        title: 'MCP与Agent框架支持',
        description: '通过 MCP 或 SDK 一键接入 Coze、Dify 等主流 Agent 框架，统一记忆后端。'
      },
      {
        title: 'API接口文档',
        description: '完整的 REST API 与 SDK 参考，涵盖鉴权、记忆读写、检索等核心接口。'
      }
    ]
  },
  changelog: {
    title: '更新日志',
    description: '所有值得注意的更新和改进都将记录在这里',
    releaseNotes: '发版说明'
  },
  dashboard: {
    nav: {
      apiReference: 'API 文档',
      overview: '概览',
      errorcode: '错误码'
    }
  },
  api: {
    body: '请求体',
    response: '响应体',
    showChildAttrs: '展示属性',
    hideChildAttrs: '隐藏属性'
  },
  assistant: {
    title: '助手',
    suggestions: '参考问题',
    inputPlaceholder: '请输入你想了解的问题...',
    welcome: 'Hi，我是MemOS知识库助手小忆，您有什么问题可以直接向我提问！',
    systemError: '系统繁忙，请稍后再试'
  },
  apiKeyPicker: {
    title: '选择 API Key',
    description: '所选密钥将自动替换复制内容中的占位符。',
    projectLabel: '项目',
    keyLabel: 'API Key',
    empty: '该项目下暂无可用的 API Key，可在此直接创建。',
    emptyProject: '尚未创建项目，请先到 Dashboard 创建。',
    goDashboard: '前往 Dashboard',
    manageInDashboard: '也可前往 {dashboard} 创建和管理密钥',
    keyNameLabel: 'Key 名称',
    keyNamePlaceholder: '请输入 Key 名称',
    defaultKeyName: '默认密钥',
    create: '创建并使用',
    createFailed: '创建失败，请稍后重试，或前往 Dashboard 创建。',
    cancel: '取消',
    confirm: '使用该密钥',
    loadFailed: 'API Key 加载失败，请稍后重试。',
    copy: '复制代码到剪贴板'
  }
}
