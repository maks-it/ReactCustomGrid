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

import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import { CanUseDOM } from '../../functions'

// CSS Modulses Server Side Prerendering
const s = CanUseDOM() ? require('./scss/style.module.scss') : require('./scss/style.module.scss.json')

const HScrollBar = (props) => {
  const { min, max, step, value, onChange } = props

  const keyDown = (e) => {
    e.preventDefault()

    const { min, max, step, value } = e.target

    if (['ArrowRight'].includes(e.key)) {
      onChange({
        target: {
          value: parseInt(value) + parseInt(step) > parseInt(max) ? parseInt(max) : parseInt(value) + parseInt(step)
        }
      })
    }

    if (['ArrowLeft'].includes(e.key)) {
      onChange({
        target: {
          value: parseInt(value) - parseInt(step) < parseInt(min) ? parseInt(min) : parseInt(value) - parseInt(step)
        }
      })
    }
  }

  const rangeRef = useRef(null)
  useEffect(() => {
    rangeRef.current.addEventListener('keydown', keyDown, false)
    return () => {
      rangeRef.current.removeEventListener('keydown', keyDown)
    }
  }, [])

  return <input ref={rangeRef} type="range" className={s.hSlider} min={min} max={max} step={step} value={value} onChange={onChange} />
}

HScrollBar.propTypes = {
  min: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  max: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  step: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onChange: PropTypes.func
}

HScrollBar.defaultProps = {
  min: 0,
  max: 0,
  step: 1,
  value: 0,
  onChange: null
}

export default HScrollBar
