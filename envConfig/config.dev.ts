export default {
  env: 'dev',
  cnDomain: 'http://localhost:3000',
  enDomain: 'http://localhost:3000',
  // 本地联调指向预发后端与预发 Dashboard（见 README/计划：手动写 memos_token_dev cookie）
  dashboardUrl: 'https://memos-dashboard-pre.openmem.net',
  dashboardApiBase: 'https://apigw-pre.memtensor.cn',
  authCookieName: 'memos_token_dev'
}
