'use strict'

const async = require('async')
const extract = require('./extract')
const path = require('path')

function filesToAnnotations (files) {
  var annotationsMatches
  var annotations = []
  files.forEach(function (file) {
    annotationsMatches = file.data.match(/\/\*[ \t\n]*@a-pollo[\s\S]*?\*\//g)
    annotationsMatches.forEach(function (annotation) {
      annotations.push({
        path: file.path,
        data: annotation
      })
    })
  })
  return annotations
}

function clean (filePath) {
  var filePathCleaned = path.parse(filePath)
  filePathCleaned.relative = path.relative(process.cwd(), filePathCleaned.dir)
  return filePathCleaned
}

function parse (files, cb) {
  var docs = []

  function toData (files, cb) {
    const annotations = filesToAnnotations(files)
    async.each(annotations,
      function (annotation, done) {
        extract.html(annotation.data, function (err, html) {
          if (err) { done(err) }
          docs.push({
            author: extract.author(annotation.data),
            category: extract.category(annotation.data),
            code: extract.code(annotation.data),
            css: extract.css(annotation.data),
            date: extract.date(annotation.data),
            doc: extract.doc(annotation.data),
            path: clean(annotation.path),
            html: {
              code: html.code,
              snippet: extract.htmlSnippet(annotation.data),
              source: html.code,
              text: html.text
            },
            icon: extract.icon(annotation.data),
            name: extract.name(annotation.data),
            params: extract.params(annotation.data),
            public: extract.public(annotation.data),
            returns: extract.returns(annotation.data),
            text: extract.text(annotation.data),
            version: extract.version(annotation.data)
          })
          done(null)
        })
      },
      function (err) {
        if (err) { cb(err) }
        cb(null, docs)
      }
    )
  }

  toData(files, cb)
}

module.exports = parse