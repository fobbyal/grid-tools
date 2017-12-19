import React from 'react'
import R from 'ramda'
import { strCol, numCol, boolCol, selCol } from '../cols'
import Chance from 'chance'
const chance = new Chance()
//* test helpers
const randomRow = R.compose(
  R.fromPairs,
  R.map(({ ident, type }) => {
    switch (type) {
      case 'str':
      case 'sel':
        return [ident, chance.word()]
      case 'num':
        return [ident, chance.floating({ fixed: 2, min: 0, max: 50000 })]
      case 'bool':
        return [ident, chance.bool()]
    }
  })
)

const createRow = _ => randomRow(headers)

const createData = R.compose(R.map(createRow), R.range(1))

/* prettier-ignore */
const headers = [
  strCol({ ident: 'unitId', display: 'Unit' }),
  strCol({ ident: 'he', display: 'HE' }),
  strCol({ ident: 'fixedGen', display: 'Fixed Gen' }),
  numCol({ ident: 'emerMinOvr', display: 'Emer Min' }),
  numCol({ ident: 'ecoMinOvr', display: 'Eco Min' }),
  numCol({ ident: 'ecoMaxOvr', display: 'Eco Max' }),
  numCol({ ident: 'emerMaxOvr', display: 'Emer Max' }),
  strCol({ ident: 'commitStatusOvr', display: 'Commit Status', }),
  strCol({ ident: 'commitStatus', display: 'Commit Status' }),
  numCol({ ident: 'regMwOvr', display: 'Reg Mw' }),
  numCol({ ident: 'regMinOvr', display: 'Reg Min' }),
  numCol({ ident: 'regMaxOvr', display: 'Reg Max' }),
  strCol({ ident: 'regAStatusOvr', display: 'Reg A Status' }),
  strCol({ ident: 'spilling', display: 'Spilling' }),
  numCol({ ident: 'reducedRampRatePct', display: 'Reduce Ramp Percent', }),
  numCol({ ident: 'regAPrice', display: 'Reg A Price' }),
  numCol({ ident: 'regACost', display: 'Reg A Cost' }),
  numCol({ ident: 'regAPerfPrice', display: 'Reg A Perf Price', }),
  numCol({ ident: 'regAPerfCost', display: 'Reg A Perf Cost' }),
  strCol({ ident: 'regDStatus', display: 'Reg D status' }),
  numCol({ ident: 'regDPrice', display: 'Reg D Price' }),
  numCol({ ident: 'regDCost', display: 'Reg D Cost' }),
  numCol({ ident: 'regDPerfPrice', display: 'Reg D Perf Price', }),
  numCol({ ident: 'regDPerfCost', display: 'Reg D Perf Cost' }),
  numCol({ ident: 'spinMwOvr', display: 'Spin Mw' }),
  numCol({ ident: 'spinMaxOvr', display: 'Spin Max' }),
  strCol({ ident: 'spinStatusOvr', display: 'Spin Status' }),
  numCol({ ident: 'spinPrice', display: 'Spin Price' }),
]

const sumWidth = R.compose(R.sum, R.map(({ width }) => width))

const flexCellStyle = ({ width }) => ({
  flex: `0 0 ${width}px`,
})

const flexRowStyle = ({ rowWidth }) => ({
  display: 'flex',
  width: sumWidth(headers),
})

const eventBroadcaster = listeners => e =>
  listeners.filter(l => !R.isNil(l)).forEach(l => l(e))

class FlexGrid extends React.Component {
  /** move over code to select and copy data */
  static ROW_INDEX_ATTRIBUTE = 'data-row-index'
  static COLUMN_INDEX_ATTRIBUTE = 'data-column-index'
  static extractPosition = evt => ({
    rowIndex: parseInt(evt.target.getAttribute(FlexGrid.ROW_INDEX_ATTRIBUTE)),
    columnIndex: parseInt(
      evt.target.getAttribute(FlexGrid.COLUMN_INDEX_ATTRIBUTE)
    ),
  })

  state = { selectedRow: undefined, hoveredRow: undefined }

  getColumnHeaderProps = ({ key, ...rest }) => ({
    key,
    style: flexCellStyle(rest),
  })

  getRowProps = ({ key, index, isHeader = false, style, headers }) => ({
    key: key || index,
    style: {
      ...flexRowStyle({
        rowWidth: this.props.rowWidth || sumWidth(headers),
      }),
      // let input style override
      ...style,
    },
    isSelected: !isHeader && this.state.selectedRow === index,
    isHovered: !isHeader && this.state.hoveredRow === index,
    // TODO add on click and remember to call the input onClick as well as
  })

  cellMouseDown = e => {
    console.log('this is ', this, 'event is ', e)
  }

  cellMouseOver = e => {
    console.log('this is ', this, 'event is ', e)
  }

  getCellProps = ({
    key,
    rowIndex,
    columnIndex,
    header,
    data,
    style,
    onClick,
    onMouseOver,
    rowData,
    ...rest
  }) => ({
    key: key || rowIndex + '*' + columnIndex,
    'data-row-index': rowIndex,
    'data-column-index': columnIndex,
    style: {
      ...flexCellStyle({ ...header }),
      ...style,
    },
    // TODO no broadcast... use rowIndex and columnIndex to identify clicked cells
    // and use common onClicked event
    onMouseDown: this.cellMouseDown,
    onMouseOver: this.cellMouseOver,
    ...rest,
  })

  renderColumnHeaderContent = ({ display }) => 'header-content'

  renderCellContent = ({ header, rowIndex, columnIndex, data, rowData }) => {
    console.log('rendered cell')
    return 'cell-content'
  }

  render() {
    return this.props.render({
      getColumnHeaderProps: this.getColumnHeaderProps,
      getRowProps: this.getRowProps,
      getCellProps: this.getCellProps,
      renderColumnHeaderContent: this.renderColumnHeaderContent,
      renderCellContent: this.renderCellContent,
    })
  }
}

const defaultFlexGridRenderer = ({ data, headers, style, className }) => ({
  getColumnHeaderProps,
  getRowProps,
  getCellProps,
  renderColumnHeaderContent,
  renderCellContent,
}) => (
  <div style={style} className={className}>
    {/* the header row */}
    <div {...getRowProps({ isHeader: true, headers })}>
      {headers.map((header, index) => (
        <div {...getColumnHeaderProps({ index, header })}>
          {renderColumnHeaderContent({ header, index, data })}
        </div>
      ))}
    </div>
    {/* table body */}
    {data.map((rowData, rowIndex) => (
      <div {...getRowProps({ index: rowIndex, headers })}>
        {headers.map((header, columnIndex) => (
          <div
            {...getCellProps({
              rowIndex,
              columnIndex,
              header,
              data,
              rowData,
            })}
          >
            {renderCellContent({
              data,
              rowData,
              header,
              rowIndex,
              columnIndex,
            })}
          </div>
        ))}
      </div>
    ))}
  </div>
)

const GridDemo = () => {
  return (
    <FlexGrid
      render={defaultFlexGridRenderer({
        headers,
        data: createData(15),
      })}
    />
  )
}

export default GridDemo
