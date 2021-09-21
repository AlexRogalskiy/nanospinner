import { green, red, yellow } from 'nanocolors'
import { isInteractive, symbols } from '../constants/index.js'

export function createSpinner(text = '', opts = {}) {
  let { stream = process.stderr } = opts
  let current = 0,
    timer

  let spinner = {
    text,
    interval: opts.interval || 25,
    frames: opts.frames || symbols.frames,
    isTTY: stream && stream.isTTY,

    reset() {
      current = 0
      timer = null
    },

    write(str, clear = false) {
      if (!isInteractive) return

      clear && stream.write(`\x1b[1G`)
      stream.write(`${str}`)

      return spinner
    },

    render() {
      let frame = spinner.frames[current]
      let str = `${yellow(frame)} ${spinner.text}`
      spinner.isTTY && spinner.write(`\x1b[?25l`)
      spinner.write(str, true)
    },

    spin() {
      spinner.render()
      current = (current + 1) % spinner.frames.length

      return spinner
    },

    loop() {
      spinner.spin()
      timer = setTimeout(() => spinner.loop(), spinner.interval)
    },

    start() {
      spinner.reset()
      spinner.loop()
      return spinner
    },

    stop(opts = {}) {
      let frame = spinner.frames[current]
      let { mark = yellow(frame), text = spinner.text } = opts

      spinner.write(`\x1b[2K\x1b[1G`)
      spinner.write(`${mark} ${text}\n`)
      spinner.isTTY && spinner.write(`\x1b[?25h`)

      clearTimeout(timer)
      return spinner
    },

    success(opts) {
      return spinner.stop({ ...opts, mark: green(symbols.tick) })
    },

    error(opts) {
      return spinner.stop({ ...opts, mark: red(symbols.cross) })
    }
  }

  return spinner
}
