/* global CodeMirror define */
/**
 * THIS IS A FORK OF ADDON/FOLD/MARKDOWN-FOLD
 *
 * See: https://codemirror.net/addon/fold/markdown-fold.js
 *
 * This is necessary, because our mode basically _is_
 * Markdown, but it can't be named as such.
 */

(function (mod) {
  if (typeof exports === 'object' && typeof module === 'object') { // CommonJS
    mod(require('codemirror/lib/codemirror'))
  } else if (typeof define === 'function' && define.amd) { // AMD
    define(['codemirror/lib/codemirror'], mod)
  } else { // Plain browser env
    mod(CodeMirror)
  }
})(function (CodeMirror) {
  'use strict'

  CodeMirror.registerHelper('fold', 'markdown', function (cm, start) {
    const maxDepth = 100

    function isHeader (lineNo) {
      const tokentype = cm.getTokenTypeAt(CodeMirror.Pos(lineNo, 0))
      return tokentype && /\bheader\b/.test(tokentype)
    }

    function headerLevel (lineNo, line, nextLine) {
      let match = line && line.match(/^#+/)
      if (match && isHeader(lineNo)) return match[0].length
      match = nextLine && nextLine.match(/^[=-]+\s*$/)
      if (match && isHeader(lineNo + 1)) return nextLine[0] === '=' ? 1 : 2
      return maxDepth
    }

    if(cm.getLine(start.line).match(/^```+/)){
      const maxDepth = 100

    function isFence (lineNo) {
      // const tokentype = cm.getTokenTypeAt(CodeMirror.Pos(lineNo, 0))
      // return tokentype && /\bheader\b/.test(tokentype)
      const tokentype = cm.getTokenTypeAt(CodeMirror.Pos(lineNo, 0))
      //console.log(cm.getTokenTypeAt(CodeMirror.Pos(0, 0)))
      //console.log(/\bcode\b/.test(cm.getTokenTypeAt(CodeMirror.Pos(0, 0))))
      return tokentype && /\bcode\b/.test(tokentype)
    }

    function fenceLevel (lineNo, line, nextLine) {
      // let match = line && line.match(/^#+/)
      let match = line && line.match(/^```+/)
      if (match && isFence(lineNo)) return match[0].length
      match = nextLine && nextLine.match(/^[=-]+\s*$/)
      if (match && isFence(lineNo + 1)) return nextLine[0] === '=' ? 1 : 2
      return maxDepth
    }

    const firstLine = cm.getLine(start.line)
    let nextLine = cm.getLine(start.line + 1)
    const level = fenceLevel(start.line, firstLine, nextLine)
    if (level === maxDepth) return undefined

    const lastLineNo = cm.lastLine()
    let end = start.line
    let nextNextLine = cm.getLine(end + 2)
    while (end < lastLineNo) {
      if (fenceLevel(end + 1, nextLine, nextNextLine) <= level) break
      ++end
      nextLine = nextNextLine
      nextNextLine = cm.getLine(end + 2)
    }

    return {
      from: CodeMirror.Pos(start.line, firstLine.length),
      to: CodeMirror.Pos(end, cm.getLine(end).length)
    }
    }
    else{

    const firstLine = cm.getLine(start.line)
    let nextLine = cm.getLine(start.line + 1)
    const level = headerLevel(start.line, firstLine, nextLine)
    if (level === maxDepth) return undefined

    const lastLineNo = cm.lastLine()
    let end = start.line
    let nextNextLine = cm.getLine(end + 2)
    while (end < lastLineNo) {
      if (headerLevel(end + 1, nextLine, nextNextLine) <= level) break
      ++end
      nextLine = nextNextLine
      nextNextLine = cm.getLine(end + 2)
    }

    return {
      from: CodeMirror.Pos(start.line, firstLine.length),
      to: CodeMirror.Pos(end, cm.getLine(end).length)
    }
  }
  })
})
