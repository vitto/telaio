
/*
const logger = require('./lib/logger')
const loggerOpts = {
  muted: false,
  verbosity: 8
}

logger(loggerOpts).intro()
logger(loggerOpts).error('Hello')
console.log(logger(loggerOpts).options())
*/

const collections = require('metalsmith-collections')
const layouts = require('metalsmith-layouts')
const markdown = require('metalsmith-markdown')
const metalsmith = require('metalsmith')
const permalinks = require('metalsmith-permalinks')

const annotations = require('./lib/annotations')
const commandLine = require('./lib/command-line')
const configuration = require('./lib/config')
const filter = require('./lib/filter')
const parse = require('./lib/parse')
const save = require('./lib/save')

function aPollo (cb) {
  commandLine(function (args) {
    configuration(args).load(function (err, config) {
      if (err) { throw err }
      annotations(config.styleguide.docs).list(function (err, matches) {
        if (err) { throw err }
        filter(matches, function (err, files) {
          if (err) { throw err }
          parse(files, function (err, docs) {
            if (err) { throw err }
            save(config, docs, function (err, config, docs) {
              if (err) { throw err }
              cb(config, docs)
            })
          })
        })
      })
    })
  })
}

module.exports = aPollo

aPollo(function (config, docs) {
  const m = config.metalsmith
  metalsmith(__dirname)
    .metadata(m.metadata)
    .source(m.source)
    .destination(m.destination)
    .clean(m.clean)
    .use(collections(m.collections))
    .use(markdown(m.markdown))
    .use(permalinks(m.permalinks))
    .use(layouts(m.layouts))
    .build(function (err) {
      if (err) { throw err }
      console.log('Build done')
    })
})
