import { BaseSideService } from '@zeppos/zml/base-side'

// Configuration - UPDATE THESE!
const CONFIG = {
  // Your Clawdbot/webhook endpoint
  apiBase: 'https://your-server.com/api/watch',
  // Optional: auth token
  authToken: 'your-secret-token'
}

AppSideService(
  BaseSideService({
    onInit() {
      console.log('Clawdy Side Service initialized')
    },

    onRequest(req, res) {
      console.log('Request received:', req.method)

      switch (req.method) {
        case 'GET_STATUS':
          this.getStatus(res)
          break
        case 'SEND_COMMAND':
          this.sendCommand(req.params, res)
          break
        default:
          res(null, { error: 'Unknown method' })
      }
    },

    async getStatus(res) {
      try {
        const response = await fetch({
          url: `${CONFIG.apiBase}/status`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CONFIG.authToken}`,
            'Content-Type': 'application/json'
          }
        })

        const data = typeof response.body === 'string' 
          ? JSON.parse(response.body) 
          : response.body

        res(null, {
          result: {
            weather: data.weather || 'No data',
            nextEvent: data.nextEvent || 'No events',
            unreadEmails: data.unreadEmails || 0
          }
        })
      } catch (error) {
        console.log('Error fetching status:', error)
        // Return mock data on error for testing
        res(null, {
          result: {
            weather: '5°C Cloudy',
            nextEvent: 'No events today',
            unreadEmails: 3
          }
        })
      }
    },

    async sendCommand(params, res) {
      try {
        const response = await fetch({
          url: `${CONFIG.apiBase}/command`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            command: params.command,
            timestamp: Date.now()
          })
        })

        const data = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body

        res(null, { result: { success: true, data } })
      } catch (error) {
        console.log('Error sending command:', error)
        res(null, { result: { success: false, error: error.message } })
      }
    },

    onRun() {},
    onDestroy() {}
  })
)
