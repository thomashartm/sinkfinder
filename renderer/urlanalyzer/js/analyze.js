'use strict'

const Scraper = require('scraper')
const sinkFinder = require('sinkfinder')
const Configuration = require('scanconfiguration')
const {ipcRenderer} = require('electron')

let allowAction = true

const isInProgress = (text) => {
  let message = (text !== undefined && text.length > 0) ? text : 'Working ...'
  allowAction = false
  let statusPanel = document.getElementById('status')
  statusPanel.innerHTML = '<p><em>' + message + '</em></p>'
}

const isReady = (text) => {
  let statusPanel = document.getElementById('status')
  statusPanel.innerHTML = ''
  allowAction = true
}

const reportSinkHandler = (findings) => {
  console.log(findings)

  for (let id in findings) {
    const finding = findings[id]
    ipcRenderer.send('addFinding', finding)
  }
}

const injectAction = (url) => {
  console.log(url)
}

const errorHandler = (reason) => {
  console.log(reason) // Error!
}

const findSyncs = async (configuration, links) => {
  isInProgress('Probing ... please wait')
  await sinkFinder.locatePayloads(configuration, links)
    .then(reportSinkHandler, errorHandler)
    .catch(console.error)
  isReady()
}

document.getElementById('clearScanResults').addEventListener('click', () => {
  console.log("Send clear event");
  ipcRenderer.send('clearScanResults', {})
})

// start scan button
document.getElementById('quickAnalysisBtn').addEventListener('click', () => {
  if (!allowAction) {
    console.log('Actions blocked right now')
    return
  }
  const urlValue = document.getElementById('targetUrl').value
  if (urlValue !== undefined && urlValue.length > 0) {
    isInProgress('Scraping ... please wait')
    let configuration = new Configuration({
      url: urlValue,
      deep: false,
      full: false
    })

    let scraper = new Scraper()
    let linksPromise = scraper.find(configuration)
    linksPromise.then(function (result) {
      let links = result
      findSyncs(configuration, links)
    }, function (err) {
      console.log(err)
      isReady()
    })

  } else {
    alert('Please add a valid URL')
  }
})

ipcRenderer.on('clearedScanResults', (event, sources) => {
  // clear results table
  const resultsTable = getResultsTable()
  while (resultsTable.firstChild) {
    resultsTable.removeChild(resultsTable.firstChild);
  }
})

ipcRenderer.on('addedFinding', (event, finding) => {
  console.log(finding)
  const resultsTable = getResultsTable()

  const dataRow = resultsTable.insertRow();
  dataRow.setAttribute('id', finding.id)

  const displayValue = createDisplayValue(finding)
  var valueCell = dataRow.insertCell(0);
  valueCell.innerHTML= `${displayValue}`

  const actions = createAction(finding.id)
  var actionCell = dataRow.insertCell(1);
  actionCell.innerHTML= `${actions}`
})

const createDisplayValue = (finding) =>{
  return `Url: ${finding.url}<br>MutatedUrl: ${finding.mutatedUrl}<br>`
}

const getResultsTable = () => {
  return document.getElementById('results')
}

const createAction = (elementId) => {
  const buttonStyle = 'class="button button-inline" id="injectBtn"'
  return `<button ${buttonStyle} data-element-id="${elementId}" onClick="injectAction()">Inject</button>`
}
