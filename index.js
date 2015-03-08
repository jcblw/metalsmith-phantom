'use strict'

var http = require('http')
var ecstatic = require('ecstatic')
var phantom = require('phantom')
var qs = require('querystring')
var async = require('async')
var exec = require('child_process').exec

function Phantom (options) {
  if (!(this instanceof Phantom)) {
    return new Phantom(options)
  }
  this.options = options || {}

  if (options.debug) {
    return this
  }
  return this.onBuild.bind(this)
}

Phantom.prototype.onBuild = function (files, metalsmith, done) {
  var self = this

  this.options.destination = metalsmith.destination()
  this.files = files
  metalsmith.write(files, this.createServer(function (err, page) {
    if (err) {
      throw err
    }

    self.page = page

    var fns = Object.keys(self.options)
      .filter(Phantom.filterOptions)
      .map(self._mapFunctions.bind(self))

    async.series(fns, self.onFinish(done))
  }))
}

Phantom.prototype.onFinish = function (done) {
  var self = this
  return function (err, files) {
    if (err) throw err
    files.forEach(function (file) {
      self.files[file.name] = {
        contents: file.content
      }
    })
    self.phantom.exit()
    exec('kill ' + self.phantom.process.pid, done)
    self.phantom = null
    self.page = null
    self.files = null
  }
}

Phantom.prototype.createServer = function (callback) {
  var server = http.createServer(ecstatic({ root: this.options.destination }))
  var port = this.options.port || 8888
  var createPage = this.createPage.bind(this)

  this.options.port = port
  server.listen(port)
  return function (err) {
    if (err) throw err // we should probably just exit
    createPage(callback, server.close.bind(server))
  }
}

Phantom.prototype.createPage = function (callback, onExit) {
  var self = this
  function handleCreatePhantom (ph) {
    self.phantom = ph
    ph.createPage(callback.bind(null, null))
  }
  phantom.create(handleCreatePhantom, {onExit: onExit})
}

Phantom.filterOptions = function (fileName) {
  return fileName !== 'port' &&
    fileName !== 'destination' &&
    fileName !== 'timeout'
}

Phantom.prototype._mapFunctions = function (fileName) {
  var self = this
  return function (next) {
    var current = self.options[fileName]
    var query = current.query ? '?' + qs.stringify(current.query) : ''
    var timer
    var hasResponded

    function getContent () {
      clearTimeout(timer)
      if (hasResponded) return
      hasResponded = true
      self.page.get('content', function (content) {
        next(null, {
          name: fileName,
          content: new Buffer(content, 'utf8')
        })
      })
    }

    function handleConsole (data) {
      if (data === 'PageRendered') {
        getContent()
      }
    }

    self.page.onConsoleMessage(handleConsole)
    self.page.open('http://localhost:' + self.options.port + '/' + current.path + query)
    timer = setTimeout(getContent, self.options.timeout || 5000)
  }
}

module.exports = Phantom
