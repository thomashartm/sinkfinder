'use strict'

// using CommonJS modules
const Split = require('split-grid')

const {ipcRenderer} = require('electron')

let allowAction = true

const isInProgress = (text) => {
  let message = (text !== undefined && text.length > 0) ? text : 'Working ...'
  allowAction = false
  let statusPanel = document.getElementById('status')
  statusPanel.innerHTML = '<p><em>' + message + '</em></p>'
}

const isReady = () => {
  let statusPanel = document.getElementById('status')
  statusPanel.innerHTML = ''
  allowAction = true
}

const split = Split({ // gutters specified in options
  columnGutters: [{
    track: 1,
    element: document.querySelector('.column-1'),
  }, {
    track: 3,
    element: document.querySelector('.column-3'),
  }],
  rowGutters: [{
    track: 1,
    element: document.querySelector('.row-1'),
  }]
})

const getTargetUrl = () => {
  const urlValue = document.getElementById('targetUrl').value
  if (urlValue !== undefined && urlValue.length > 0) {
    return urlValue
  }
  throw new Error('There is no target URL defined.')
}

const createDisplayValue = (finding) => {
  return `Url: ${finding.url}<br>MutatedUrl: ${finding.mutatedUrl}<br>`
}

const getResultsTable = () => {
  return document.getElementById('results')
}

const updateElement = (elementId, data) => {
  const element = document.getElementById(elementId)
  element.innerHTML = `${data}`
}

const createAction = (elementId) => {
  const buttonStyle = 'class="button button-inline" id="injectBtn"'
  return `<button ${buttonStyle} data-element-id="${elementId}" onClick="detailsAction(${elementId})">Details</button>`
}

const clearTable = () => {
  console.log("Perform clear table now")
  const resultsTable = getResultsTable()
  while (resultsTable.firstChild) {
    resultsTable.removeChild(resultsTable.firstChild)
  }
}

const detailsAction = (id) => {
  console.log(id)
  ipcRenderer.send('get-finding-details', id)
}

// DOM tree event listeners
document.getElementById('clear-scan-results').addEventListener('click', () => {
  clearTable()
})

// start scan button
document.getElementById('quickAnalysisBtn').addEventListener('click', () => {
  if (!allowAction) {
    console.log('Actions blocked right now')
    return
  }
  clearTable()
  ipcRenderer.send('scrape-and-analyze-links', {targetUrl: getTargetUrl()})
})

document.getElementById('linkAnalysisBtn').addEventListener('click', () => {
  if (!allowAction) {
    console.log('Actions blocked right now')
    return
  }
  clearTable()
  ipcRenderer.send('analyze-link', {targetUrl: getTargetUrl()})
})

ipcRenderer.on('fetched-finding-from-datastore', (event, data) => {
  console.log('Fetched from datastore')
  console.log(data)
})

// ipcRender event listeners
ipcRenderer.on('progress-update', (event, data) => {
  console.log('in-progress')
  isInProgress('Work in progress ... please wait')
})

ipcRenderer.on('ready', (event, data) => {
  console.log('ready')
  isReady("")
})

ipcRenderer.on('foundRecord', (event, data) => {
  console.log('Found record')
  console.log(data)

  updateElement("resultdetails", data)
})

ipcRenderer.on('clear-scan-results', (event, sources) => {
  // clear results table
  console.log("Perform clear table now")
  const resultsTable = getResultsTable()
  while (resultsTable.firstChild) {
    resultsTable.removeChild(resultsTable.firstChild)
  }
})

ipcRenderer.on('addFinding', (event, finding) => {
  const resultsTable = getResultsTable()

  const dataRow = resultsTable.insertRow()
  dataRow.setAttribute('id', finding.id)

  const displayValue = createDisplayValue(finding)
  var valueCell = dataRow.insertCell(0)
  valueCell.innerHTML = `${displayValue}`

  const actions = createAction(finding.id)
  var actionCell = dataRow.insertCell(1)
  actionCell.innerHTML = `${actions}`
})
