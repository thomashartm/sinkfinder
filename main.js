'use strict'

const path = require('path')
const {app, ipcMain} = require('electron')

const Window = require('./Window')
const DataStore = require('./DataStore')

require('electron-reload')(__dirname)

const dataStore = new DataStore({name: 'SinkFinder Results'})

function main () {
  let mainWindow = new Window({
    file: path.join('renderer', 'urlanalyzer/index.html')
  })

  ipcMain.on('clearScanResults', (event, finding) => {
    const store = dataStore.clear()
    mainWindow.send('clearedScanResults', finding)
  })

  ipcMain.on('addFinding', (event, finding) => {
    const store = dataStore.addFinding(finding)
    console.log('Saved finding')
    console.log(store)
    // now resend the event to the rendering window

    mainWindow.send('addedFinding', finding)
  })

  ipcMain.on('getFinding', (event, id) => {
    const findings = dataStore.getFinding(id)
    console.log(findings)

    mainWindow.send('foundRecord', findings)
  })
}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
