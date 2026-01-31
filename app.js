import { BaseApp } from '@zeppos/zml/base-app'

App(
  BaseApp({
    globalData: {
      // Clawdbot API endpoint (your VPS)
      apiBase: 'https://your-clawdbot-endpoint.com/api',
      // Cached data
      status: null,
      weather: null,
      events: [],
      emails: []
    },

    onCreate() {
      console.log('Clawdy app created')
    },

    onDestroy() {
      console.log('Clawdy app destroyed')
    }
  })
)
