const puppeteer = require('puppeteer')
const urlHandler = require('url-handler')

const Sink = function(url) {
  this.id = -1
  this.url = url
  this.mutatedUrl = ''
  this.urlWithPlaceholder = ''
  this.data = []
}

let SinkFinder = function (positiveMatch, stopMatch) {

  this.positiveMatch = positiveMatch

  this.stopMatch = stopMatch

  this.sinkType = undefined

  this.identifySink = function (html, index) {
    if (this.positiveMatch.length == 0 || this.stopMatch == 0) {
      console.log('Unable to identify sink as no positive or stop pattern were configured.')
      return
    }

    let start = index
    let end = index

    let stop = false

    let result = {
      expectedSinkType: this.sinkType,
      positive: false,
      match: undefined,
      sequence: undefined
    }

    while (!stop && start > 0) {
      end = start + 1
      start = start - 5
      const snippet = html.substring(start, end)
      result.sequence = snippet

      let stopIndex = -1
      for (let stopMatch of this.stopMatch) {
        stopIndex = snippet.indexOf(stopMatch)
        if (stopIndex > -1) {
          //console.log("Found stop match [" + stopMatch + "]. Ignoring it as context does not fit. Expected context: [" + this.sinkType + "].");
          result.match = stopMatch
          stop = true
        }
      }

      for (let positive of this.positiveMatch) {
        let positiveIndex = snippet.indexOf(positive)
        if (positiveIndex > -1 && positiveIndex > stopIndex) {
          result.positive = true
          result.match = positive
          return result
        }
      }
    }

    return result
  }
}

module.exports = {

  luckyHitParamName: 'g00dluCk',

  separator: '-xx-',

  defaultHeadlessBrowserConfig: {
    headless: true,
    dumpio: false,
    args: [
      '--disable-xss-auditor', // Disables Blink's XSSAuditor. The XSSAuditor mitigates reflective XSS. ↪
    ]
  },

  payloads: {
    doubleQuote: {
      type: 'double quote',
      mode: 'quick',
      name: 'ujz',
      value: '"ujz',
      regex: new RegExp('"ujz', 'g'),
      character: '"',
      sinkFinder: new SinkFinder(['=' + this.character, ':' + this.character], ['>']),
      findContext: function (html, index) {
        //console.log("Sink context search: " + this.type);
        this.sinkFinder.sinkType = 'attribute'
        return this.sinkFinder.identifySink(html, index)
      }
    },

    singleQuote: {
      type: 'single quote',
      mode: 'quick',
      name: 'ugz',
      value: '\'ugz',
      regex: new RegExp('\'ugz', 'g'),
      character: '\'',
      sinkFinder: new SinkFinder(['=' + this.character, ':' + this.character], ['>']),
      findContext: function (html, index) {
        //console.log("Sink context search: " + this.type);
        this.sinkFinder.sinkType = 'attribute'
        return this.sinkFinder.identifySink(html, index)
      }
    },

    lessThan: {
      type: 'less-than',
      mode: 'quick',
      name: 'ltn',
      value: '<ltn',
      regex: new RegExp('<ltn', 'g'),
      character: '<',
      sinkFinder: new SinkFinder(['>'], ['<!--', '="', ':"', '=\'', ':\'']),
      findContext: function (html, index) {
        //console.log("Sink context search: " + this.type);
        this.sinkFinder.sinkType = 'element'
        return this.sinkFinder.identifySink(html, index)
      }
    },

    greaterThan: {
      type: 'greater-than',
      mode: 'quick',
      name: 'gtn',
      value: '>gtn',
      regex: new RegExp('>gtn', 'g'),
      character: '>',
      sinkFinder: new SinkFinder(['<'], ['<!--']),
      findContext: function (html, index) {
        //console.log("Sink context search: " + this.type);
        this.sinkFinder.sinkType = 'element'
        return this.sinkFinder.identifySink(html, index)
      }
    },

    backTic: {
      type: 'back-tic',
      mode: 'full',
      name: 'btdb',
      value: '`btdb',
      regex: new RegExp('`btdb', 'g'),
      character: '`',
      sinkFinder: new SinkFinder(['=' + this.character, ':' + this.character], ['>']),
      findContext: function (html, index) {
        //console.log("Sink context search: " + this.type);
        this.sinkFinder.sinkType = 'attribute'
        return this.sinkFinder.identifySink(html, index)
      }
    },

    equalsThan: {
      type: 'equals-than',
      mode: 'full',
      name: 'eqpt',
      value: '=eqpt',
      regex: new RegExp('=eqpt', 'g'),
      character: '=',
      sinkFinder: new SinkFinder(['=' + this.character, ':' + this.character], ['>']),
      findContext: function (html, index) {
        //console.log("Sink context search at " + index + ": " + this.type);
        this.sinkFinder.sinkType = 'script'
        return this.sinkFinder.identifySink(html, index)
      }
    },

    openBrace: {
      type: 'open-brace',
      mode: 'full',
      name: 'opdb',
      value: '(opdb',
      regex: new RegExp('\\(opdb', 'g'),
      character: '(',
      sinkFinder: new SinkFinder(['="', ':"'], ['>']),
      findContext: function (html, index) {
        //console.log("Sink context search: " + this.type);
        this.sinkFinder.sinkType = 'script'
        return this.sinkFinder.identifySink(html, index)
      }
    },

    closedBrace: {
      type: 'closed-brace',
      mode: 'full',
      name: 'cldb',
      value: ')cldb',
      regex: new RegExp('\\)cldb', 'g'),
      character: ')',
      sinkFinder: new SinkFinder(['(', '="', ':"'], ['>']),
      findContext: function (html, index) {
        //console.log("Sink context search: " + this.type);
        this.sinkFinder.sinkType = 'script'
        return this.sinkFinder.identifySink(html, index)
      }
    },
  },

  getMutatorStatement: function (fullPayloadScope) {
    let payloads = this.payloads
    let statement = payloads.doubleQuote.value
      + payloads.singleQuote.value
      + payloads.lessThan.value
      + payloads.greaterThan.value

    if (fullPayloadScope) {
      statement += payloads.backTic.value
      statement += payloads.openBrace.value
      statement += payloads.closedBrace.value
      statement += payloads.equalsThan.value
    }
    return statement
  },

  mutateValue: function (key, value, full) {
    //Adding param to the payload to later detect which one caused the match
    return value + this.getMutatorStatement(full) + this.separator + key
  },

  injectHerePlaceHolder: function (key, value, full) {
    //Adding param to the payload to later detect which one caused the match
    return value + '[[INJECTHERE]]'
  },

  permutateParamByParam: function (url, full) {
    let context = urlHandler.parseUri(url)

    let Target = function (mutatedUrl, urlPattern) {
      this.mutatedUrl = mutatedUrl
      this.injectUrl = urlPattern
    }

    const urlVariations = []
    const params = context.queryKey
    for (var prop in params) {
      const value = params[prop]
      const paramValueIdentifier = prop + '=' + value
      const mutated = prop + '=' + this.mutateValue(prop, value, full)
      const mutatedUrl = url.replace(paramValueIdentifier, mutated)

      const injectReplacePattern = prop + '=' + this.injectHerePlaceHolder(value)
      const injectReplaceUrl = url.replace(paramValueIdentifier, injectReplacePattern)

      const target = new Target(mutatedUrl, injectReplaceUrl)
      urlVariations.push(target)
    }

    return urlVariations
  },

  analyzeHtml: function (url, variation, html) {
    const analysisResult = this.analyzeResponse(html)
    const sink = new Sink(url)
    sink.mutatedUrl = variation.mutatedUrl
    sink.urlWithPlaceholder = variation.injectUrl

    for (let result in analysisResult) {
      const data = analysisResult[result]
      const hit = {
        payloadId: data.id,
        payloadValue: data.matches[0],
        index: data.matches['index'],
        context: data.extract,
        sink: data.sinkContext
      }

      sink.data.push(hit)
    }
    return sink
  },

  identifySinkContext: function (html, index, payload) {
  },

  extractSinkLocation: function (html, index) {
    const upperBound = (html.length < index + 100) ? html.length : index + 100
    const lowerBound = (index < 50) ? 0 : index - 50

    return html.substring(lowerBound, upperBound)
  },

  analyzeResponse: function (response) {
    const matches = []
    for (let i in this.payloads) {
      let payload = this.payloads[i]

      if (payload.type != undefined) {

        let payloadMatch = payload.regex.exec(response)
        while (payloadMatch != null) {

          const sinkContext = payload.findContext(response, payloadMatch['index'], payload)
          if (sinkContext.positive) {
            const extract = this.extractSinkLocation(response, payloadMatch['index'])
            const result = {
              id: payload.type,
              payload: payload,
              matches: payloadMatch,
              sinkContext: sinkContext,
              extract: extract
            }
            matches.push(result)
          }
          payloadMatch = payload.regex.exec(response)
        }
      }
    }

    return matches
  },

  locatePayloads: function (configuration, links) {
    return new Promise(async (resolve, reject) => {
      try {
        let alreadyProcessed = []
        let totalResults = []

        const urls = links
        const fullMutation = configuration.full
        let relevantFindingCounter = 0
        for (let u in urls) {

          const url = urls[u]
          if (alreadyProcessed.indexOf(url) < 0) {

            const urlVariations = this.permutateParamByParam(url, fullMutation)

            // adding both as we had some edge cases were URLs were called multiple times.
            alreadyProcessed.push(url)
            alreadyProcessed = alreadyProcessed.concat(urlVariations)


            for (urlVariation of urlVariations) {
              const browser = await puppeteer.launch(this.defaultHeadlessBrowserConfig)

              const page = await browser.newPage()
              if (configuration.useAuthentication()) {
                await page.authenticate(configuration.getCredentials())
              }

              await page.goto(urlVariation.mutatedUrl, {waitUntil: 'networkidle2'})
              const html = await page.content()
              await browser.close()
              const finding = this.analyzeHtml(url, urlVariation, html)

              if (finding.data.length > 0) {
                finding.id = relevantFindingCounter
                totalResults.push(finding)
                console.log('Add sinks for ' + urlVariation.mutatedUrl + ' with id ' + relevantFindingCounter)
                relevantFindingCounter++
              } else {
                console.log('Unable to find sinks for ' + urlVariation.mutatedUrl)
              }
            }
          }
        }
        return resolve(totalResults)
      } catch (e) {
        return reject(e)
      }
    })
  }
}
