'use strict'

const {ipcMain} = require('electron')
const IpcHandler = require('./IpcHandler')
const DataStore = require('./DataStore')

class PersistanceController extends IpcHandler {

  constructor (window) {
    super(window)
    this.dataStore = new DataStore({name: 'SinkFinder Results'})
  }

  initializeHandlers () {
    this.registerHandler('clear-scan-results', (event, args) => {
        this.dataStore.clear()
        event.sender.send('clearedScanResults', {message: 'Datastore cleared'})
      }
    )

    this.registerHandler('addFinding', (event, finding) => {
        console.log('Saved finding')
        const store = this.dataStore.addFinding(finding)
        console.log(store)
        event.sender.send('addedFinding', finding)
      }
    )

    this.registerHandler('getFinding', (event, id) => {
        const findings = this.dataStore.getFinding(id)
        console.log(findings)
        event.sender.send('foundRecord', findings)
      }
    )
  }
}

module.exports = PersistanceController
