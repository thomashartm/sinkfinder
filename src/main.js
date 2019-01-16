'use strict'

const path = require('path')
const {app, ipcMain} = require('electron')

const Window = require('./Window')
const PersistanceController = require('./PersistanceController')

require('electron-reload')(__dirname)

const main  = () => {
  let mainWindow = new Window({
    file: path.join('renderer', 'urlanalyzer/index.html')
  })

  const persistanceController = new PersistanceController(mainWindow)
  persistanceController.initializeHandlers()
}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
