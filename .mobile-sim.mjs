import { chromium, devices } from 'playwright'
const iPhone = devices['iPhone 13 Pro']
const ctx = await chromium.launchPersistentContext('/tmp/pw-mobile-sim', {
  headless: false,
  ...iPhone,
  args: ['--no-first-run', '--no-default-browser-check', '--window-position=40,40'],
})
const page = ctx.pages()[0] || await ctx.newPage()
await page.goto('http://localhost:3000/en', { waitUntil: 'domcontentloaded' })
console.log('MOBILE SIM OPEN: iPhone 13 Pro @ http://localhost:3000/en')
await new Promise(() => {}) // keep window open
