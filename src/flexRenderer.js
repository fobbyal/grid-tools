import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'

//const isScrolledTable = props => pro

const Cell = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  text-overflow: ellipsis;
  overflow: hidden;
  border-right: 1px solid #ccc;
  display: flex;
  justify-content: ${props => props.alignment || 'center'};
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
  left: 0px;
  overflow: hidden;
  /*
   * colCount is for the 1px border for each Header... 
   * box-sizing doesn't work here because it does not count children
 */
  width: ${props => props.width + props.colCount}px;
`.withComponent(Grid.SyncedScrollPane)

const ColHeader = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  border-right: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: steelblue;
  color: white;
  font-weight: bold;
  font-size: 0.85em;
  padding-left: 0.2em;
  padding-right: 0.2em;
`

const TableContentContainer = styled(Grid.SyncedScrollPane)`
  position: absolute;
  left: 0px;
  top: ${props => props.headerRowHeight}px;
  //header.length is for the border box and 17 is for the scroll height = width
  width: ${props => props.width + 17 + props.headers.length}px;
  height: ${props => props.height - props.headerRowHeight + 17}px;
  overflow: scroll;
`

const TableContent = props =>
  props.scroll ? (
    <TableContentContainer {...props}>{props.children}</TableContentContainer>
  ) : (
    props.children
  )

// const ScrollingPane

export class FlexGridRow extends React.PureComponent {
  render() {
    const { children, scroll, ...rest } = this.props

    return scroll ? (
      <ScrollingHeaderRow {...rest}>{children}</ScrollingHeaderRow>
    ) : (
      <Row {...rest}>{children}</Row>
    )
  }
}

export class FlexGridCell extends React.PureComponent {
  render() {
    // console.log('cell rendered')
    const {
      isSelected,
      isHovered,
      rowIndex,
      columnIndex,
      header,
      width,
      height,
      data,
      ...rest
    } = this.props
    return (
      <Cell
        {...rest}
        width={width}
        height={height}
        title={data[rowIndex][header.ident]}
      >
        {data[rowIndex][header.ident]}
      </Cell>
    )
  }
}

export class FlexGridColHeader extends React.PureComponent {
  render() {
    const { header, width, ...rest } = this.props
    return (
      <ColHeader width={width} {...rest}>
        {header.display}
      </ColHeader>
    )
  }
}

const flexGridRenderer = ({
  data,
  headers,
  style,
  className,
  height,
  width,
  rowHeight,
  headerRowHeight,
  /**
   * add headerRenderer
   * and rowRenderer
   */
} = {}) => ({ getColumnHeaderProps, getRowProps, getCellProps }) => {
  const scroll = width && height && headerRowHeight
  return (
    <div
      style={{
        position: 'relative',
        ...style,
      }}
      className={className}
    >
      {/* the header row */}
      <FlexGridRow
        {...getRowProps({
          isHeader: true,
          headers,
          width,
          rowHeight,
          headerRowHeight,
        })}
        scroll={scroll}
      >
        {headers.map((header, index) => (
          <FlexGridColHeader {...getColumnHeaderProps({ index, header })} />
        ))}
      </FlexGridRow>
      {/* table body */}
      <TableContent
        height={height}
        width={width}
        headerRowHeight={headerRowHeight}
        headers={headers}
        scroll={scroll}
      >
        {R.range(0, data.length).map(rowIndex => (
          <FlexGridRow
            {...getRowProps({
              index: rowIndex,
              headers,
              rowHeight,
            })}
          >
            {headers.map((header, columnIndex) => (
              <FlexGridCell
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
    </div>
  )
}
export default flexGridRenderer
