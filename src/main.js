'use strict'

const path = require('path')
const {app, ipcMain} = require('electron')

const Window = require('./Window')
const PersistenceController = require('./PersistanceController')
const PageAnalysisController = require('./PageAnalysisController')

require('electron-reload')(__dirname)

const main  = () => {
  let mainWindow = new Window({
    file: path.join('renderer', 'urlanalyzer/index.html')
  })

  const persistanceController = new PersistenceController(mainWindow)

  const pageAnalysisController = new PageAnalysisController(mainWindow, persistanceController)

  persistanceController.initializeHandlers()
  pageAnalysisController.initializeHandlers()
}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
