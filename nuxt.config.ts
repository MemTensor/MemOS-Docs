import yaml from '@rollup/plugin-yaml'
import type { NuxtConfig } from '@nuxt/schema'
import pkg from './package.json'
import { getCnRoutes, getCnApiReferenceRoutes } from './scripts/extract-routes.mjs'

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

const config: NuxtConfig = {
  app: {
    head: {
      script: [
        { src: 'https://cdn.memtensor.com.cn/file/js-cookie-3.0.5.min.js', type: 'text/javascript', defer: true },
        { src: 'https://cdn.memtensor.com.cn/file/locale.1.1.2.min.js', type: 'text/javascript', defer: true },
        {
          innerHTML: `(function(){var h=location.hostname;if(h.indexOf('-pre.')!==-1||h==='localhost')return;(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","wfn83tdrco");window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-7J1J9RW0T1');var s=document.createElement('script');s.async=1;s.src='https://www.googletagmanager.com/gtag/js?id=G-7J1J9RW0T1';document.head.appendChild(s);})();`,
          type: 'text/javascript'
        }
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
      apiBase: 'https://apigw.memtensor.cn'
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
    enabled: process.dev
  },

  // 本机开发时同时监听 IPv4，避免仅绑定 ::1 导致浏览器走 127.0.0.1 时「打不开」
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  vite: {
    plugins: [
      yaml()
    ],
    optimizeDeps: {
      include: ['debug']
    }
  },

  ssr: true,

  css: ['~/assets/css/main.css'],

  ui: {
    fonts: false,
    colorMode: true
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    storage: 'cookie',
    storageKey: 'memos-docs-color-mode'
  },

  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['bash', 'shell', 'ts', 'typescript', 'diff', 'vue', 'json', 'yml', 'css', 'mdc', 'python', 'py', 'mermaid', 'markdown', 'md'],
          // 与 @nuxt/content 解析器一致；显式指定避免仅传 langs 时落到偏淡的默认主题
          theme: {
            default: 'github-light-high-contrast',
            dark: 'github-dark-default'
          }
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
