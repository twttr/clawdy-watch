import { BaseSideService } from '@zeppos/zml/base-side'

// Try local config first, fall back to template
let CONFIG
try {
  CONFIG = require('./config.local.js').CONFIG
} catch (e) {
  CONFIG = require('./config.js').CONFIG
}

AppSideService(
  BaseSideService({
    onInit() {
      console.log('Clawdy Side Service initialized')
    },

    onRequest(req, res) {
      console.log('Request:', req.method)

      if (req.method === 'GET_STATUS') {
        this.getStatus(res)
      } else if (req.method === 'SEND_COMMAND') {
        this.sendCommand(req.params, res)
      } else if (req.method === 'SEND_VOICE') {
        this.sendVoice(req.params, res)
      } else {
        res(null, { error: 'Unknown method' })
      }
    },

    async sendVoice(params, res) {
      console.log('Voice data length:', params.data?.length || 0)
      
      if (!params.data) {
        res(null, { result: { success: false, error: 'No data' } })
        return
      }

      try {
        const response = await fetch({
          url: CONFIG.apiBase + '/voice',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + CONFIG.authToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: params.data,
            filename: params.filename || 'voice.opus',
            timestamp: Date.now()
          })
        })
        
        const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
        console.log('Backend response:', JSON.stringify(data))
        res(null, { result: { success: true, transcription: data.transcription } })
      } catch (e) {
        console.log('Voice upload error:', e)
        res(null, { result: { success: false, error: e.message } })
      }
    },

    async getStatus(res) {
      try {
        const response = await fetch({
          url: CONFIG.apiBase + '/status',
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + CONFIG.authToken, 'Content-Type': 'application/json' }
        })
        const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
        res(null, { result: { weather: data.weather, nextEvent: data.nextEvent, unreadEmails: data.unreadEmails } })
      } catch (e) {
        res(null, { result: { weather: '?', nextEvent: 'None', unreadEmails: 0 } })
      }
    },

    async sendCommand(params, res) {
      try {
        const response = await fetch({
          url: CONFIG.apiBase + '/command',
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + CONFIG.authToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: params.command, timestamp: Date.now() })
        })
        const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
        res(null, { result: { success: true, data } })
      } catch (e) {
        res(null, { result: { success: false } })
      }
    },

    onRun() {},
    onDestroy() {}
  })
)
