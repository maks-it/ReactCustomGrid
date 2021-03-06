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

import React from 'react'
import PropTypes from 'prop-types'

import TableRow from '../TableRow'
import { HeadCell, BodyCell } from '../Cells'
import SizeBox from '../SizeBox'

// Components
import ContentEditable from '../ContentEditable'

// Functions
import { DeepMerge, CanUseDOM } from '../functions'

// External functions
import * as math from 'mathjs';

// CSS Modulses Server Side Prerendering
const s = CanUseDOM() ? require('./scss/style.module.scss') : require('./scss/style.module.scss.json')

const Body = (props) => {
  const { columns, items, vSlicer, hSlicer, maxCols, maxRows, emitSlect, emitChange } = props

  const visibleColumns = Object.keys(columns).slice(hSlicer, hSlicer + maxCols)
  const visibleItems = items.slice(vSlicer, vSlicer + maxRows)

  let tabIndex = null

  return <tbody className={s.tbody}>
    {visibleItems.map((row, rowIndex) => {
      rowIndex = rowIndex + vSlicer
      return <TableRow key={rowIndex} className={[s.tr]}>

        <HeadCell scope="row" className={[s.th]}>
          <SizeBox type="rowSwap" row={rowIndex} disabled style={row.__style || {}}>
            {rowIndex + 1}
          </SizeBox>
        </HeadCell>

        {Object.keys(columns).map((colName, colIndex) => {

          // retreive initial tabindex, then increment
          if(!tabIndex) {
            tabIndex = (rowIndex * Object.keys(columns).length) + colIndex

            // console.log(`rowIndex: ${rowIndex}`)
            // console.log(`visibleColumns: ${Object.keys(columns).length}`)
            // console.log(`colIndex ${colIndex}`)
            // console.log(`start index ${tabIndex}`)

          } else {
            tabIndex++
          }

          // render only visible columns
          if(!visibleColumns.includes(colName)) {
            return null
          }
          
          const sizeBoxStyle = DeepMerge(columns[colName].__style || {}, row.__style || {})
          // if (Object.keys(sizeBoxStyle).length !== 0 ) console.log(sizeBoxStyle)

          switch (columns[colName]?.dataType) {
            case 'row-select':
              return <BodyCell key={colIndex} className={[s.td]}>
                <SizeBox disabled style={row.__style || {}}>
                  <input {...{
                    type: "checkbox",
                    tabIndex: tabIndex,
                    checked: row.selected,
                    style: { margin: '0px' },
                    onChange: () => emitSlect(row.id)
                  }} />
                </SizeBox>
              </BodyCell>

            case 'image':
              return <BodyCell key={colIndex} className={[s.td]}>
                <SizeBox disabled>
                  <img src={row[colName]} alt="" className="img-fluid img-thumbnail" />
                </SizeBox>
              </BodyCell>

            case 'date-time':
              return <BodyCell key={colIndex} className={[s.td]}>
              <SizeBox name={colName} disabled style={sizeBoxStyle}>
                {row[colName]}
              </SizeBox>
            </BodyCell>

            case 'formula':
              let value = row[colName]?.toString()

              Object.keys(row).forEach(colName => {
                value = value.replace(colName, row[colName])
              })

              try {
                value = math.evaluate(value)
              }
              catch (e) {
                value = e.toString()
              }

              return <BodyCell key={colIndex} className={[s.td]}>
                <SizeBox name={colName} disabled style={sizeBoxStyle}>
                  <div {...{
                    tabIndex: tabIndex
                  }}>{value}</div>
                </SizeBox>
              </BodyCell>
            
            default:
              return <BodyCell key={colIndex} className={[s.td]}>
              <SizeBox name={colName} disabled style={sizeBoxStyle}>
                <ContentEditable {...{
                  tabIndex: tabIndex,
                  name: colName,
                  value: row[colName]?.toString(),
                  onChange: (e) => emitChange(e, row.id)
                  // onLeave: (e) => console.log(e)
                }}/>
              </SizeBox>
            </BodyCell>
          }
        })}
      </TableRow>
    })}
  </tbody>
}

Body.propTypes = {
  columns: PropTypes.object,
  items: PropTypes.array,
  chunk: PropTypes.number,
  emitSlect: PropTypes.func,
  emitChange: PropTypes.func
}

Body.defaultProps = {
  columns: {},
  items: [],
  chunk: 0,
  emitSelect: null,
  emitChange: null
}

export default Body
