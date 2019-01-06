const fastify = require('fastify')()
const puppeteer = require('puppeteer');

let browser;

const schedulePage = 'https://www.imsa.com/schedule'
const schedulesClass = 'div.group-right-content.field-group-div > div.field.field-name-field-title.field-type-link-field.field-label-hidden > div > div > a'

fastify.get('/', async (request, reply) => {

  if (!browser) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
  }

  const page = await browser.newPage();

  await page.goto(schedulePage);

  const series = await page.$$eval(schedulesClass, elements => {
    return elements.map(s => ({ href: s.href, name: s.innerText }))
  })

  reply.send(series)
  await page.close()
})

const start = async () => {
  try {
    await fastify.listen(process.env.PORT || 3000)
  } catch (err) {
    fastify.log.error(err)
    if (browser) {
      browser.close()
    }
    process.exit(1)
  }
}

start()

module.export = fastify
