import { createWidget, widget, align, prop } from '@zos/ui'
import { back } from '@zos/router'
import { px } from '@zos/utils'
import { showToast } from '@zos/interaction'
import { BasePage } from '@zeppos/zml/base-page'

Page(
  BasePage({
    build() {
      // Title
      createWidget(widget.TEXT, {
        x: px(24),
        y: px(24),
        w: px(432),
        h: px(48),
        text: '⚡ Quick Actions',
        text_size: px(32),
        color: 0xffffff,
        align_h: align.CENTER_H
      })

      // Action buttons
      const actions = [
        { label: '💬 Ping Clawdy', command: 'ping' },
        { label: '🏠 Lights Toggle', command: 'lights_toggle' },
        { label: '🔊 TTS Test', command: 'tts_test' },
        { label: '📧 Check Email', command: 'check_email' }
      ]

      actions.forEach((action, index) => {
        createWidget(widget.BUTTON, {
          x: px(24),
          y: px(96 + index * 80),
          w: px(432),
          h: px(64),
          text: action.label,
          radius: px(12),
          normal_color: 0x333333,
          press_color: 0x555555,
          click_func: () => this.sendCommand(action.command, action.label)
        })
      })

      // Back button
      createWidget(widget.BUTTON, {
        x: px(24),
        y: px(420),
        w: px(432),
        h: px(56),
        text: '← Back',
        radius: px(12),
        normal_color: 0x222222,
        press_color: 0x444444,
        click_func: () => back()
      })
    },

    sendCommand(command, label) {
      showToast({ content: `Sending: ${label}` })
      
      this.request({
        method: 'SEND_COMMAND',
        params: { command }
      })
        .then((data) => {
          console.log('Command response:', JSON.stringify(data))
          if (data.result?.success) {
            showToast({ content: '✅ Done!' })
          } else {
            showToast({ content: '❌ Failed' })
          }
        })
        .catch((err) => {
          console.log('Error sending command:', err)
          showToast({ content: '❌ Error' })
        })
    }
  })
)
