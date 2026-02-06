import yaml from '@rollup/plugin-yaml'
import type { NuxtConfig } from '@nuxt/schema'
import pkg from './package.json'
import { getCnRoutes, getCnApiReferenceRoutes } from './scripts/extract-routes.mjs'
import remarkReplaceDomains from './scripts/remark-replace-domains.mjs'

const cnRoutes = getCnRoutes()
const cnApiRoutes = getCnApiReferenceRoutes()
// Get locale from command line arguments or environment variable
const env = process.env.NUXT_ENV_CONFIG || 'prod'

const envConfig = await import(`./envConfig/config.${env}.ts`).then(m => m.default).catch(() => {
  return {
    env: 'prod',
    enDomain: 'https://memos-docs.openmem.net'
  }
})

const staticCdnUrl = envConfig.staticCdnUrl || 'https://statics.memtensor.com.cn'
const cdnUrl = envConfig.cdnUrl || 'https://cdn.memtensor.com.cn'

const config: NuxtConfig = {
  app: {
    head: {
      script: [
        { innerHTML: `window.__RUNTIME_CONFIG__ = { 
          tokenDomain: '${envConfig.cookieDomain}',
          homeCnUrl: '${envConfig.docsUrl}',
          homeIntlUrl: '${envConfig.docsIntl}',
        };`, type: 'text/javascript' },
        { src: 'https://cdn.memtensor.com.cn/file/js-cookie-3.0.5.min.js', type: 'text/javascript' },
        { src: 'https://cdn.memtensor.com.cn/file/1769744406627_z3x4mb.js', type: 'text/javascript' }
      ]
    }
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxtjs/i18n'
  ],

  runtimeConfig: {
    public: {
      ...envConfig,
      version: pkg.version,
      apiBase: 'https://apigw.memtensor.cn',
      staticCdnUrl,
      cdnUrl
    }
  },

  i18n: {
    locales: [
      {
        code: 'cn',
        iso: 'zh-CN',
        name: '中文'
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English'
      }
    ],
    defaultLocale: 'en',
    // locale prefix added for every locale except default
    strategy: 'prefix_except_default',
    vueI18n: './i18n.config.ts',
    detectBrowserLanguage: false,
    pages: undefined
  },

  devtools: {
    enabled: true
  },

  vite: {
    plugins: [
      yaml()
    ],
    optimizeDeps: {
      include: ['debug']
    },
    build: {
      rollupOptions: {
        external: ['remark-replace-domains']
      }
    }
  },

  ssr: true,

  css: ['~/assets/css/main.css'],

  ui: {
    fonts: false,
    colorMode: false
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-replace-domains': {
            instance: remarkReplaceDomains,
            options: {
              imageDomains: {
                'https://cdn.memtensor.com.cn': cdnUrl,
                'https://statics.memtensor.com.cn': staticCdnUrl
              },
              linkDomains: {
                'https://memos-playground.openmem.net': envConfig.playgroundUrl,
                'https://memos-dashboard.openmem.net': envConfig.dashboardUrl,
                'https://memos.openmem.net': envConfig.homeDomain,
                'https://memos.memtensor.cn/api': envConfig.baseUrl
              }
            }
          }
        },
        highlight: {
          langs: ['bash', 'shell', 'ts', 'typescript', 'diff', 'vue', 'json', 'yml', 'css', 'mdc', 'python', 'py', 'mermaid', 'markdown', 'md']
        }
      }
    }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/',
        '/cn',
        ...cnRoutes,
        ...cnApiRoutes
      ],
      crawlLinks: true
    }
  },

  // routeRules: {
  //   '/': {
  //     redirect: '/open_source/home/overview'
  //   },
  //   '/cn': {
  //     redirect: '/cn/open_source/home/overview'
  //   }
  // },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify'
  },

  uiPro: {
    license: process.env.NUXT_UI_PRO_LICENSE
  }
}

export default defineNuxtConfig(config)
