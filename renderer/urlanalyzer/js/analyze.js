'use strict'

// using CommonJS modules
const Split = require('split-grid')
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

const detailsAction = (id) => {
  console.log(id)
  ipcRenderer.send('getFinding', id)
}

const errorHandler = (reason) => {
  console.log(reason) // Error!
}

const identifyPotentialSinks = async (configuration, links) => {
  isInProgress('Probing ... please wait')
  await sinkFinder.locatePayloads(configuration, links)
    .then(reportSinkHandler, errorHandler)
    .catch(console.error)
  isReady()
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


document.getElementById('clearScanResults').addEventListener('click', () => {
  console.log('Send clear event')
  ipcRenderer.send('clearScanResults', {})
})

// start scan button
document.getElementById('quickAnalysisBtn').addEventListener('click', () => {
  if (!allowAction) {
    console.log('Actions blocked right now')
    return
  }
  ipcRenderer.send('clearScanResults', {})
  const urlValue = getTargetUrl()
  try {
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
      identifyPotentialSinks(configuration, links)
    }, function (err) {
      console.log(err)
      isReady()
    })
  } catch (err) {
    alert(err)
  }
})

document.getElementById('linkAnalysisBtn').addEventListener('click', () => {
  if (!allowAction) {
    console.log('Actions blocked right now')
    return
  }
  ipcRenderer.send('clearScanResults', {})
  try {
    const urlValue = getTargetUrl()
    identifyPotentialSinks(new Configuration({
      url: urlValue,
      deep: false,
      full: false
    }), [urlValue])
  } catch (err) {
    alert(err)
  }
})

const getTargetUrl = () => {
  const urlValue = document.getElementById('targetUrl').value
  if (urlValue !== undefined && urlValue.length > 0) {
    return urlValue
  }
  throw new Error('There is no target URL defined.')
}


ipcRenderer.on('foundRecord', (event, data) => {
  console.log("Found record")
  console.log(data)

  updateDetailsSection(data)
})


ipcRenderer.on('clearedScanResults', (event, sources) => {
  // clear results table
  const resultsTable = getResultsTable()
  while (resultsTable.firstChild) {
    resultsTable.removeChild(resultsTable.firstChild)
  }
})

ipcRenderer.on('addedFinding', (event, finding) => {
  console.log(finding)
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

const createDisplayValue = (finding) => {
  return `Url: ${finding.url}<br>MutatedUrl: ${finding.mutatedUrl}<br>`
}

const getResultsTable = () => {
  return document.getElementById('results')
}

const updateDetailsSection = (data) => {
  const details = document.getElementById('resultdetails')
  details.innerHTML = `${data}`
}

const createAction = (elementId) => {
  const buttonStyle = 'class="button button-inline" id="injectBtn"'
  return `<button ${buttonStyle} data-element-id="${elementId}" onClick="detailsAction(${elementId})">Details</button>`
}
