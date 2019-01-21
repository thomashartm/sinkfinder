'use strict'

const {ipcMain} = require('electron')
const IpcHandler = require('./IpcHandler')
const FindingsDataStore = require('./DataStore')

class PersistanceController extends IpcHandler {

  constructor (window) {
    super(window)
    this.dataStore = new FindingsDataStore({name: 'SinkFinder Results'})
  }

  initializeHandlers () {
    this.registerHandler('clear-scan-results', (event, args) => {
        this.dataStore.clear()
        event.sender.send('clearedScanResults', {message: 'Datastore cleared'})
      }
    )
  }

  addFinding(finding) {
    console.log('Stored finding in datastore')
    const store = this.dataStore.addFinding(finding)
    console.log(store)
  }

  getFinding(id) {
    const result = this.dataStore.getFinding(id)
    console.log('fetch data for id '+  id)
    console.log(result)
    return result
  }
}

module.exports = PersistanceController
