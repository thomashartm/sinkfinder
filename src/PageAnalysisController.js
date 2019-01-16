'use strict'

const IpcHandler = require('./IpcHandler')
const sinkFinder = require('sinkfinder')
const Configuration = require('scanconfiguration')
const Scraper = require('scraper')

const handleError = (reason) => {
  console.log(reason) // Error!
}

class SinkFinderJob {

  constructor(event, targetUrl){
    this.configuration = new Configuration({
      url: targetUrl,
      deep: false,
      full: false
    })

    this.event = event
  }

  scrapeSources () {
    let scraper = new Scraper()
    return scraper.find(this.configuration)
  }

  async identifyPotentialSinks (links) {
    const publishFinding = (findings) => {
      console.log("Starting publishing")
      console.log(findings)
      console.log(this.event)
      for (let id in findings) {
        const finding = findings[id]
        console.log(finding)
        this.event.sender.send('addFinding', finding)
      }
    }

    await sinkFinder.locatePayloads(this.configuration, links)
      .then(publishFinding, handleError)
      .catch(console.error)
  }
}


class PageAnalysisController extends IpcHandler {

  constructor (window) {
    super(window)
  }

  initializeHandlers () {
    this.registerHandler('analyze-link', async (event, config) => {
        console.log("fired analyze-links handler")
        event.sender.send('progress-update', "Work in progress")
        try {
          const sinkFinder = new SinkFinderJob(event, config.targetUrl)
          await sinkFinder.identifyPotentialSinks([config.targetUrl])
          event.sender.send('ready', "")
        } catch (err) {
          console.log(err)
        }
      }
    )

    this.registerHandler('scrape-and-analyze-links', async (event, config) => {
        console.log("fired scrape-and-analyze-links handler")
      event.sender.send('progress-update', "Work in progress")
        try {
          const sinkFinder = new SinkFinderJob(event, config.targetUrl)
          const promise = sinkFinder.scrapeSources([config.targetUrl])

          promise.then(async function (result) {
            let links = result
            await sinkFinder.identifyPotentialSinks(links)
            event.sender.send('ready', "")
          }, function (err) {
            console.log(err)
            event.sender.send('ready', "")
          })

        } catch (err) {
          console.log(err)
        }
      }
    )


  }
}

module.exports = PageAnalysisController
