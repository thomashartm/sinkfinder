'use strict'

const PersistanceController = require('./PersistanceController')
const IpcHandler = require('./IpcHandler')
const sinkFinder = require('sinkfinder')
const Configuration = require('scanconfiguration')
const Scraper = require('scraper')



const handleError = (reason) => {
  console.log(reason) // Error!
}

class SinkFinderJob {

  constructor (event, persistenceService, targetUrl) {
    this.configuration = new Configuration({
      url: targetUrl,
      deep: false,
      full: false
    })
    this.persistenceService = persistenceService
    this.event = event
  }

  scrapeSources () {
    let scraper = new Scraper()
    return scraper.find(this.configuration)
  }

  async identifyPotentialSinks (links) {
    const publishFinding = (findings) => {
      console.log('Starting publishing')
      console.log(findings)
      console.log(this.event)
      for (let id in findings) {
        const finding = findings[id]
        console.log(finding)
        this.persistenceService.addFinding(finding)
        this.event.sender.send('addFinding', finding)
      }
    }

    await sinkFinder.locatePayloads(this.configuration, links)
      .then(publishFinding, handleError)
      .catch(console.error)
  }
}

class PageAnalysisController extends IpcHandler {

  constructor (window, persistenceService) {
    super(window)
    this.persistenceService = persistenceService
  }

  initializeHandlers () {
    this.registerHandler('analyze-link', async (event, config) => {
        console.log('fired analyze-links handler')
        event.sender.send('progress-update', 'Work in progress')
        try {
          const sinkFinder = new SinkFinderJob(event, this.persistenceService, config.targetUrl)
          await sinkFinder.identifyPotentialSinks([config.targetUrl])
          event.sender.send('ready', '')
        } catch (err) {
          console.log(err)
        }
      }
    )

    this.registerHandler('scrape-and-analyze-links', async (event, config) => {
        console.log('fired scrape-and-analyze-links handler')
        event.sender.send('progress-update', 'Work in progress')
        try {
          const sinkFinder = new SinkFinderJob(event, this.persistenceService, config.targetUrl)
          const promise = sinkFinder.scrapeSources([config.targetUrl])

          promise.then(async function (result) {
            let links = result
            await sinkFinder.identifyPotentialSinks(links)
            event.sender.send('ready', '')
          }, function (err) {
            console.log(err)
            event.sender.send('ready', '')
          })

        } catch (err) {
          console.log(err)
        }
      }
    )

    this.registerHandler('get-finding-details', async (event, id) => {
      const finding = this.persistenceService.getFinding(id)
      event.sender.send('fetched-finding-from-datastore', finding)
    })

  }
}

module.exports = PageAnalysisController
