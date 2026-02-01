import { createWidget, widget, align, prop } from '@zos/ui'
import { back } from '@zos/router'
import { px } from '@zos/utils'
import { showToast } from '@zos/interaction'
import { BasePage } from '@zeppos/zml/base-page'
import { create, id, codec } from '@zos/media'
import * as fs from '@zos/fs'

const RECORD_FILE = 'clawdy_voice.opus'
const RECORD_PATH = 'data://' + RECORD_FILE

// Manual base64 encoder (btoa not available in Zepp OS)
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function toBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let result = ''
  const len = bytes.length
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i]
    const b2 = i + 1 < len ? bytes[i + 1] : 0
    const b3 = i + 2 < len ? bytes[i + 2] : 0
    
    result += BASE64_CHARS[b1 >> 2]
    result += BASE64_CHARS[((b1 & 3) << 4) | (b2 >> 4)]
    result += i + 1 < len ? BASE64_CHARS[((b2 & 15) << 2) | (b3 >> 6)] : '='
    result += i + 2 < len ? BASE64_CHARS[b3 & 63] : '='
  }
  return result
}

Page(
  BasePage({
    state: {
      isRecording: false,
      recorder: null,
      recordBtn: null,
      statusText: null
    },

    build() {
      createWidget(widget.TEXT, {
        x: px(24), y: px(24), w: px(432), h: px(48),
        text: '\uD83C\uDFA4 Voice', text_size: px(32), color: 0xffffff, align_h: align.CENTER_H
      })

      this.state.statusText = createWidget(widget.TEXT, {
        x: px(24), y: px(100), w: px(432), h: px(80),
        text: 'Init...', text_size: px(18), color: 0xaaaaaa, align_h: align.CENTER_H
      })

      this.state.recordBtn = createWidget(widget.BUTTON, {
        x: px(133), y: px(190), w: px(200), h: px(200),
        text: '\u23FA', radius: px(100),
        normal_color: 0xcc0000, press_color: 0xff0000,
        click_func: () => this.toggleRecording()
      })

      createWidget(widget.BUTTON, {
        x: px(24), y: px(420), w: px(432), h: px(56),
        text: '\u2190 Back', radius: px(12),
        normal_color: 0x222222, press_color: 0x444444,
        click_func: () => { this.stopRecording(); back() }
      })

      this.initRecorder()
    },

    initRecorder() {
      try {
        const recorder = create(id.RECORDER)
        recorder.setFormat(codec.OPUS, { target_file: RECORD_PATH })
        this.state.recorder = recorder
        this.setStatus('Ready \uD83D\uDC4D', 0x44ff44)
      } catch (e) {
        this.setStatus('Init: ' + String(e), 0xff4444)
      }
    },

    setStatus(text, color) {
      try {
        this.state.statusText.setProperty(prop.TEXT, text)
        this.state.statusText.setProperty(prop.COLOR, color)
      } catch (e) {}
    },

    toggleRecording() {
      this.state.isRecording ? this.stopAndSend() : this.startRecording()
    },

    startRecording() {
      if (!this.state.recorder) return
      try {
        this.state.recorder.start()
        this.state.isRecording = true
        this.setStatus('\uD83D\uDD34 Recording...', 0xff4444)
        this.state.recordBtn.setProperty(prop.TEXT, '\u23F9')
      } catch (e) {
        this.setStatus('Start: ' + String(e), 0xff4444)
      }
    },

    stopRecording() {
      if (this.state.recorder && this.state.isRecording) {
        try { this.state.recorder.stop() } catch (e) {}
        this.state.isRecording = false
        this.state.recordBtn.setProperty(prop.TEXT, '\u23FA')
      }
    },

    stopAndSend() {
      this.stopRecording()
      this.setStatus('Processing...', 0xffaa00)
      setTimeout(() => this.readAndSend(), 1500)
    },

    readAndSend() {
      try {
        // Read file
        const stat = fs.statSync({ path: RECORD_FILE })
        if (!stat) {
          this.setStatus('No file', 0xff4444)
          return
        }
        
        this.setStatus('Reading ' + stat.size + 'B...', 0xffaa00)
        
        const fd = fs.openSync({ path: RECORD_FILE, flag: fs.O_RDONLY })
        const buffer = new ArrayBuffer(stat.size)
        fs.readSync({ fd: fd, buffer: buffer })
        fs.closeSync({ fd: fd })

        // Encode base64
        this.setStatus('Encoding...', 0xffaa00)
        const base64 = toBase64(buffer)
        
        this.setStatus('Sending ' + Math.round(base64.length/1024) + 'KB...', 0xffaa00)

        // Send
        this.request({
          method: 'SEND_VOICE',
          params: { data: base64, filename: RECORD_FILE }
        }).then((resp) => {
          this.setStatus('\u2705 Sent!', 0x44ff44)
          showToast({ content: 'Sent!' })
          setTimeout(() => this.setStatus('Ready \uD83D\uDC4D', 0x44ff44), 2000)
        }).catch((e) => {
          this.setStatus('Send err', 0xff4444)
        })
      } catch (e) {
        this.setStatus('Err: ' + String(e), 0xff4444)
      }
    },

    onDestroy() {
      this.stopRecording()
    }
  })
)
