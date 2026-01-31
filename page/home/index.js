import { createWidget, widget, align, text_style, prop } from '@zos/ui'
import { push } from '@zos/router'
import { px } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'

const { messageBuilder } = getApp()._options.globalData

Page(
  BasePage({
    state: {
      weather: '...',
      nextEvent: '...',
      unreadEmails: 0,
      lastUpdate: null
    },

    build() {
      // Title
      createWidget(widget.TEXT, {
        x: px(24),
        y: px(24),
        w: px(432),
        h: px(48),
        text: '🦝 Clawdy',
        text_size: px(36),
        color: 0xffffff,
        align_h: align.CENTER_H
      })

      // Weather card
      this.weatherText = createWidget(widget.TEXT, {
        x: px(24),
        y: px(96),
        w: px(432),
        h: px(64),
        text: `🌤️ ${this.state.weather}`,
        text_size: px(28),
        color: 0xcccccc,
        align_h: align.LEFT
      })

      // Next event card
      this.eventText = createWidget(widget.TEXT, {
        x: px(24),
        y: px(168),
        w: px(432),
        h: px(64),
        text: `📅 ${this.state.nextEvent}`,
        text_size: px(28),
        color: 0xcccccc,
        align_h: align.LEFT
      })

      // Unread emails
      this.emailText = createWidget(widget.TEXT, {
        x: px(24),
        y: px(240),
        w: px(432),
        h: px(64),
        text: `📧 ${this.state.unreadEmails} unread`,
        text_size: px(28),
        color: 0xcccccc,
        align_h: align.LEFT
      })

      // Refresh button
      createWidget(widget.BUTTON, {
        x: px(24),
        y: px(340),
        w: px(200),
        h: px(64),
        text: '🔄 Refresh',
        radius: px(12),
        normal_color: 0x333333,
        press_color: 0x555555,
        click_func: () => this.fetchStatus()
      })

      // Actions button
      createWidget(widget.BUTTON, {
        x: px(256),
        y: px(340),
        w: px(200),
        h: px(64),
        text: '⚡ Actions',
        radius: px(12),
        normal_color: 0x1a73e8,
        press_color: 0x4285f4,
        click_func: () => push({ url: 'page/actions/index' })
      })

      // Initial fetch
      this.fetchStatus()
    },

    fetchStatus() {
      this.request({
        method: 'GET_STATUS'
      })
        .then((data) => {
          console.log('Status received:', JSON.stringify(data))
          if (data.result) {
            this.updateUI(data.result)
          }
        })
        .catch((err) => {
          console.log('Error fetching status:', err)
        })
    },

    updateUI(data) {
      if (data.weather) {
        this.state.weather = data.weather
        this.weatherText.setProperty(prop.TEXT, `🌤️ ${data.weather}`)
      }
      if (data.nextEvent) {
        this.state.nextEvent = data.nextEvent
        this.eventText.setProperty(prop.TEXT, `📅 ${data.nextEvent}`)
      }
      if (data.unreadEmails !== undefined) {
        this.state.unreadEmails = data.unreadEmails
        this.emailText.setProperty(prop.TEXT, `📧 ${data.unreadEmails} unread`)
      }
    }
  })
)
