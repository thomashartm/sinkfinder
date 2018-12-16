'use strict'

const path = require('path')
const {app, ipcMain} = require('electron')

const Window = require('./Window')
const DataStore = require('./DataStore')

require('electron-reload')(__dirname)

function main() {
    // todo list window
    let mainWindow = new Window({
        file: path.join('renderer', 'index.html')
    })

    mainWindow.webContents.openDevTools();
}

app.on('ready', main)

app.on('window-all-closed', function () {
    app.quit()
})
