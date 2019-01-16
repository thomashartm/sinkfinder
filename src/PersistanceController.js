'use strict'

const {ipcMain} = require('electron')
const DataStore = require('./DataStore')

class PersistanceController {

  constructor (window) {
    this.dataStore = new DataStore({name: 'SinkFinder Results'})
    this.window = window


  }

  initializeHandlers (){
    if (ipcMain) {
      this.registerHandler('clearScanResults', (event, args) => {
          this.dataStore.clear()
          event.sender.send('clearedScanResults', {message: 'Datastore cleared'})
        }
      )

      this.registerHandler('addFinding', (event, finding) => {
          const store = this.dataStore.addFinding(finding)
          console.log('Saved finding')
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

  registerHandler (name, handler) {
    ipcMain.on(name, handler)
  }

  send (channelName, message) {
    this.window.webContents.send(channelName, message)
  }
}

module.exports = PersistanceController
