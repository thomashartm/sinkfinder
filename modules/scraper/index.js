const puppeteer = require('puppeteer')
const urlHandler = require('url-handler')

class Scraper {
    constructor() {
    }

    find(config) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = config.url
                const browser = await puppeteer.launch(this.defaultHeadlessBrowserConfig)
                const page = await browser.newPage()
                //if(configuration.useAuthentication()){
                //    await page.authenticate(configuration.getCredentials())
                //}

                await page.goto(url, {waitUntil: 'networkidle2'})

                const uriContext = urlHandler.parseUri(url)
                const host = uriContext.host

                const results = await page.evaluate(filterCriteria => {
                    const links = document.links
                    const hrefs = []

                    for (let i = 0; i < links.length; i++) {
                        let href = links[i].href
                        if (href != null && href.length > 0 && href.indexOf(filterCriteria) > -1) {
                            hrefs.push(href)
                        }
                    }
                    return hrefs
                }, host)

                await browser.close()
                return resolve(results)
            } catch (e) {
                return reject(e)
            }
        })
    }
}

module.exports = Scraper
