'use strict'

const Scraper = require('scraper')
const sinkFinder = require('sinkfinder')
const Configuration = require('scanconfiguration')
const {ipcRenderer} = require('electron')

let allowAction = true

const isInProgress = function (text) {
  let message = (text !== undefined && text.length > 0) ? text : 'Working ...'
  allowAction = false
  let statusPanel = document.getElementById('status')
  statusPanel.innerHTML = '<p><em>' + message + '</em></p>'
}

const isReady = function (text) {
  let statusPanel = document.getElementById('status')
  statusPanel.innerHTML = ''
  allowAction = true
}

const reportSinkHandler = function (findings) {
  console.log(findings)

  for (let id in findings) {
    const finding = findings[id]
    let resultsTable = document.getElementById('results')
    resultsTable.insertAdjacentHTML('beforeend', '<tr><td>URL: '+finding.url+'<br>Mutated URL: '+finding.mutatedUrl+'</td></tr>');
  }
}

const errorHandler = function (reason) {
  console.log(reason) // Error!
}

const findSyncs = async function (configuration, links) {
  isInProgress('Probing ... please wait')
  await sinkFinder.locatePayloads(configuration, links)
    .then(reportSinkHandler, errorHandler)
    .catch(console.error)
  isReady()
}

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
      console.log('processing results')
      console.log(links)

      findSyncs(configuration, links)
    }, function (err) {
      console.log(err)
      isReady()
    })

  } else {
    alert('Please add a valid URL')
  }
})

ipcRenderer.on('sources', (event, sources) => {

  const todoList = document.getElementById('sourcesList')
})
