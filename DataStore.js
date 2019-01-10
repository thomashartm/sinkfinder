'use strict'

const Store = require('electron-store')

class DataStore extends Store {
    constructor (settings) {
        super(settings)

        // initialize with findings or empty array
        this.findings = this.get('findings') || []
    }

    saveFindings () {
        // save findings to JSON file
        this.set('findings', this.findings)

        // returning 'this' allows method chaining
        return this
    }

    getFinding(id) {
      this.findings = this.get('findings') || []
      if(this.findings.length < id){
        return this.findings[id]
      }
      return {}
    }

    getFindings () {
        // set object's findings to findings in JSON file
        this.findings = this.get('findings') || []

        return this.findings
    }

    addFinding (finding) {
        // merge the existing findings with the new finding
        this.findings = [ ...this.findings, finding ]

        return this.saveFindings()
    }

    deleteFinding (finding) {
        // filter out the target finding
        this.findings = this.findings.filter(t => t !== finding)

        return this.saveFindings()
    }
}

module.exports = DataStore
