import React from 'react'
import styled from 'styled-components'
import R from 'ramda'

const Cell = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  text-overflow: ellipsis;
  overflow: hidden;
  border-right: 1px solid #ccc;
`

/* prettier-ignore */
const Row = styled.div`
  display: flex;
  width: ${props => props.width+props.colCount}px;
  ${props => props.height ? 'height: '+ props.height + 'px;' : ''} 
  border-bottom: 1px solid #ccc;
  ${props => props.isHeader && `
      position: absolute;
      top: 0px;
      left: 0px;
      overflow: hidden;
    `
    } 
`

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
`

export class FlexGridRow extends React.PureComponent {
  render() {
    const { children, ...rest } = this.props
    return <Row {...rest}>{this.props.children}</Row>
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
} = {}) => ({ getColumnHeaderProps, getRowProps, getCellProps }) => (
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
    >
      {headers.map((header, index) => (
        <FlexGridColHeader {...getColumnHeaderProps({ index, header })} />
      ))}
    </FlexGridRow>
    {/* table body */}
    <div
      style={{
        position: 'absolute',
        left: '0',
        top: headerRowHeight + 'px',
        width: width + 17 + 'px',
        height: height - headerRowHeight + 17,
        overflow: 'scroll',
      }}
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
    </div>
  </div>
)
export default flexGridRenderer
