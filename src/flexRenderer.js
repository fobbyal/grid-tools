import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'
import { sumWidth } from './utils'

// const isScrolledTable = props => pro

export const Cell = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  text-overflow: ellipsis;
  overflow: hidden;
  border-right: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: ${props => props.alignment || 'center'};
  ${props => (props.fontSize ? 'font-size:' + props.fontSize + ';' : '')};
  ${props => (props.color ? 'color:' + props.color + ';' : '')};
  ${props =>
    props.backgroundColor
      ? 'background-color:' + props.backgroundColor + ';'
      : ''};
  ${props => (props.fontWeight ? 'font-weight:' + props.fontWeight + ';' : '')};
`

/* prettier-ignore */
const Row = styled.div`
  display: flex;
  width: ${props => props.width}px;
  ${props => props.height ? 'height: '+ props.height + 'px;' : ''} 
  border-bottom: 1px solid #ccc;
`

const ScrollingHeaderRow = Row.extend`
  position: absolute;
  top: 0px;
  left: ${props => props.xOffSet || '0'}px;
  overflow: hidden;
  /*
   * colCount is for the 1px border for each Header... 
   * box-sizing doesn't work here because it does not count children
 */
  width: ${props => props.width + props.colCount}px;
`.withComponent(Grid.SyncedScrollPane)

export const ColHeader = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  border-right: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: ${props => props.backgroundColor || 'steelblue'};
  color: ${props => props.color || 'white'};
  font-weight: ${props => props.fontWeight || 'bold'};
  font-size: ${props => props.fontSize || '0.85em'};
  padding-left: 0.2em;
  padding-right: 0.2em;
`

const TableContentContainer = styled(Grid.SyncedScrollPane)`
  position: absolute;
  left: ${props => props.xOffSet || 0}px;
  top: ${props => props.headerRowHeight}px;
  /*header.length is for the border box and 17 is for the scroll height = width */
  width: ${props => props.width + (props.showScroll ? 17 : 0)}px;
  height: ${props =>
    props.height - props.headerRowHeight + (props.showScroll ? 17 : 0)}px;
  overflow: ${props => (props.showScroll ? 'scroll' : 'hidden')};
`

const TableContent = ({ scroll, showScroll = true, children, ...props }) =>
  R.isNil(props.width) || props.width === 0 ? null : scroll ? (
    <TableContentContainer showScroll={showScroll} {...props}>
      {children}
    </TableContentContainer>
  ) : (
    children
  )

// const ScrollingPane

class FlexGridRow extends React.PureComponent {
  render() {
    const { children, scroll, ...rest } = this.props

    return R.isNil(rest.width) || rest.width === 0 ? null : scroll ? (
      <ScrollingHeaderRow {...rest}>{children}</ScrollingHeaderRow>
    ) : (
      <Row {...rest}>{children}</Row>
    )
  }
}

export const defaultCellRenderer = ({
  isSelected,
  isHovered,
  rowIndex,
  columnIndex,
  header,
  width,
  height,
  data,
  render,
  ...rest
}) => (
  <Cell
    {...rest}
    width={width}
    height={height}
    title={data[rowIndex][header.ident]}
  >
    {data[rowIndex][header.ident]}
  </Cell>
)

class FlexGridCell extends React.PureComponent {
  render() {
    const { render = defaultCellRenderer } = this.props
    return render(this.props)
  }
}

export const defaultColHeaderRenderer = ({
  header,
  width,
  render,
  ...rest
}) => (
  <ColHeader width={width} {...rest}>
    {header.display}
  </ColHeader>
)

class FlexGridColHeader extends React.PureComponent {
  render() {
    const { render = defaultColHeaderRenderer } = this.props
    return render(this.props)
  }
}

const splitFixedCols = (numOfFixedCols, headers) => ({
  rowHeaders: R.take(numOfFixedCols, headers),
  dataHeaders: R.drop(numOfFixedCols, headers),
})

const FlexGridContainer = styled.div`
  position: relative;
`

const countKeyCols = R.compose(l => l.length, R.takeWhile(h => h.isKey))

const flexGridRenderer = ({
  data,
  headers,
  style,
  className,
  height,
  width,
  rowHeight,
  headerRowHeight,
  fixedColCount,
  autoFixColByKey,
  cellRenderer,
  colHeaderRenderer,
}) => ({ getColumnHeaderProps, getRowProps, getCellProps }) => {
  const numOfFixedCols = autoFixColByKey
    ? countKeyCols(headers)
    : fixedColCount || 0
  const scroll = width && height && headerRowHeight
  const { rowHeaders, dataHeaders } = splitFixedCols(numOfFixedCols, headers)
  const rowHeaderWidth = sumWidth(rowHeaders)
  const dataScrollWidth = width - rowHeaderWidth + rowHeaders.length

  return (
    <FlexGridContainer style={style} className={className}>
      {/* col header non-scrolling part/fixed columns */}
      <FlexGridRow
        {...getRowProps({
          isHeader: true,
          headers: rowHeaders,
          headerRowHeight,
        })}
        scroll={scroll}
      >
        {rowHeaders.map((header, index) => (
          <FlexGridColHeader
            render={colHeaderRenderer}
            {...getColumnHeaderProps({ index, header })}
          />
        ))}
      </FlexGridRow>
      {/* col header scrolling part */}
      <FlexGridRow
        {...getRowProps({
          isHeader: true,
          headers: dataHeaders,
          width: dataScrollWidth,
          headerRowHeight,
        })}
        xOffSet={rowHeaderWidth}
        scroll={scroll}
      >
        {dataHeaders.map((header, index) => (
          <FlexGridColHeader
            render={colHeaderRenderer}
            {...getColumnHeaderProps({ index, header })}
          />
        ))}
      </FlexGridRow>
      {/* table body fixed columns */}
      <TableContent
        height={height}
        width={rowHeaderWidth}
        headerRowHeight={headerRowHeight}
        headers={rowHeaders}
        scroll
        showScroll={false}
        vertical
        horizontal={false}
      >
        {R.range(0, data.length).map(rowIndex => (
          <FlexGridRow
            {...getRowProps({
              index: rowIndex,
              headers,
              rowHeight,
            })}
          >
            {rowHeaders.map((header, columnIndex) => (
              <FlexGridCell
                render={cellRenderer}
                {...getCellProps({
                  rowIndex,
                  columnIndex,
                  header,
                  data,
                })}
              />
            ))}
          </FlexGridRow>
        ))}
      </TableContent>
      {/* table body data columns */}
      <TableContent
        height={height}
        width={dataScrollWidth + dataHeaders.length}
        headerRowHeight={headerRowHeight}
        headers={dataHeaders}
        scroll
        xOffSet={rowHeaderWidth}
        showScroll
        vertical
        horizontal
      >
        {R.range(0, data.length).map(rowIndex => (
          <FlexGridRow
            {...getRowProps({
              index: rowIndex,
              headers: dataHeaders,
              rowHeight,
            })}
          >
            {dataHeaders.map((header, columnIndex) => (
              <FlexGridCell
                render={cellRenderer}
                {...getCellProps({
                  rowIndex,
                  columnIndex,
                  header,
                  data,
                })}
              />
            ))}
          </FlexGridRow>
        ))}
      </TableContent>
    </FlexGridContainer>
  )
}

export default flexGridRenderer
