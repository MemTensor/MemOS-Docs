export default {
  env: 'prod',
  homeDomain: 'https://memos.openmem.net',
  openMemUrl: 'https://memos.openmem.net/',
  githubMemosUrl: 'https://github.com/MemTensor/MemOS',
  dashboardUrl: 'https://memos-dashboard.openmem.net',
  playgroundUrl: 'https://memos-playground.openmem.net',
  // Playground 后端（Dashboard API），与 Platform 的 VITE_API 保持一致
  dashboardApiBase: 'https://memos.memtensor.cn',
  // 登录态 JWT 的 cookie 名（gray 与 prod 同名，规则与 Platform lib/token.ts 一致）
  authCookieName: 'memos_token'
}
