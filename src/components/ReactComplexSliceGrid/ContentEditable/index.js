/**
 * @license
 * Internet Systems Consortium license
 *
 * Copyright (c) 2020 Maksym Sadovnychyy (MAKS-IT)
 * Website: https://maks-it.com
 * Email: commercial@maks-it.com
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */

import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const ContentEditable = (props) => {
  const { name, value, className, mode, onChange, onClick, onLeave, ...others } = props

  const divRef = useRef(null)

  const [carretPosition, setCarretPosition] = useState(0)

  const [enabled, _setEnabled] = useState(false)
  const enabledRef = useRef(enabled)
  const setEnabled = (data) => {
    enabledRef.current = data
    _setEnabled(data)
  }

  /**
   * 
   * @param {*} el 
   * 
   * https://developer.mozilla.org/en-US/docs/Web/API/Range
   * https://developer.mozilla.org/en-US/docs/Web/API/Selection
   */
  const RetreiveCarretPosition = (el) => {
    var _range = window.getSelection().getRangeAt(0)
    var range = _range.cloneRange()
    range.selectNodeContents(el)
    range.setEnd(_range.startContainer, _range.startOffset)
    var start = range.toString().length
  
    return {
      start: start,
      end: start + _range.toString().length
    }
  }
  
  /**
   * @param {node} el 
   * @param {object} carretPosition
   * 
   * https://developer.mozilla.org/en-US/docs/Web/API/Range
   * https://developer.mozilla.org/en-US/docs/Web/API/Selection
   */
  const UpdateCarretPosition = (el, carretPosition) => {
    const range = document.createRange()
    range.setStart(el, 0)
    range.collapse(true)
  
    let charIndex = 0
    let nodeStack = [el], node, foundStart = false, stop = false
    while(!stop && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        let nextCharIndex = charIndex + node.length
        if (!foundStart && carretPosition.start >= charIndex && carretPosition.start <= nextCharIndex) {
          range.setStart(node, carretPosition.start - charIndex)
          foundStart = true
        }
        if (!foundStart && carretPosition.end >= charIndex && carretPosition.end <= nextCharIndex) {
          range.setEnd(node, carretPosition.end - charIndex)
          stop = true
        }
        charIndex = nextCharIndex
      } else {
        let i = node.childNodes.length
        while (i--) {
          nodeStack.push(node.childNodes[i])
        }
      }
    }
    
    const sel = document.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  // proxy handlers
  const _onInput = (e) => {
    
    const { innerText } = e.target

    setCarretPosition(RetreiveCarretPosition(e.target))
    
    if (onChange && {}.toString.call(onChange) === '[object Function]') {
      // reassign target value
      onChange({
        target: {
          name: name,
          value: innerText
        }
      })
    }
  }
  
  const _onClick = (e) => {
    if (onClick && {}.toString.call(onClick) === '[object Function]') {
      onClick(e)
    }
    setEnabled(true)
  }

  const handleOutsideClick = (e) => {
    if (enabledRef.current && divRef.current && !divRef.current.contains(e.target)) {
      if (onLeave && {}.toString.call(onLeave) === '[object Function]') {
        onLeave(e)
      }
      setEnabled(false)
    }
  }

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick, false)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [])
  
  useEffect(() => {
    // check if enebled, as we do not want to fire this event for all content editable divs on the page
    if (enabled) {
      UpdateCarretPosition(divRef.current, carretPosition)
    }
  }, [carretPosition, enabled])

  useEffect(() => {
    // check if enebled, as we do not want to fire this event for all content editable divs on the page
    if (enabled) {
      const textLength = divRef.current.innerText.length

      UpdateCarretPosition(divRef.current, {
        start: textLength,
        end: textLength
      })
    }
  }, [enabled])


  //https://stackoverflow.com/questions/9144644/is-there-a-way-to-prevent-a-contenteditable-element-from-scrolling-when-the-curs/9155043
  return <div ref={divRef}
    {...{
      contentEditable: enabled,
      style: !enabled
        ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
        : { outline: 'none', wordWrap: 'break-word', /*wordBreak: 'break-all'*/ },
      className: className,

      onInput: _onInput,
      onClick: _onClick,

      dangerouslySetInnerHTML: { __html: !enabled && value === '' ? '&nbsp;' : value }
    }}  

    {...others} />
}

ContentEditable.defaultProps = {
  value: '',
  onClick :null,
  onLeave: null
  
}

ContentEditable.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  onLeave: PropTypes.func
}

export default ContentEditable
