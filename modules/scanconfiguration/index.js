'use strict'

class Configuration {

  constructor (options) {
    options = Object.assign({}, options)

    this.url = options.url
    if (this.url == undefined) {
      throw new Error('Missing URL. URL is a mandatory property.')
    }

    this.hasCredentials = false
    this.deep = (options.deep !== undefined) ? options.deep : false
    this.full = (options.full !== undefined) ? options.full : false
    this.singleEval = options.singleEval !== undefined ? options.singleEval : true
    this.relaxed = options.relaxed !== undefined ? options.relaxed : true

    if (options.user !== undefined && options.password !== undefined) {
      this.addCredentials(options.user, options.password)
      this.hasCredentials = true
    }
  }

  addCredentials (user, password) {
    this.user = user
    this.password = password
  }

  useAuthentication(){
    return this.hasCredentials
  }
}

module.exports = Configuration
