'use strict'

const {ipcMain} = require('electron')

class IpcHandler{

  constructor (window){
    this.window = window
  }

  registerHandler (name, handler) {
    if(ipcMain) {
      ipcMain.on(name, handler)
    }
  }
}

module.exports = IpcHandler
