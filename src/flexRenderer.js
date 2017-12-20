import React from 'react'
import R from 'ramda'

const flexCellStyle = ({ width }) => ({
  flex: `0 0 ${width}px`,
})

const flexRowStyle = ({ rowWidth }) => ({
  display: 'flex',
  width: rowWidth,
})

export class FlexGridRow extends React.PureComponent {
  render() {
    const { key, rowWidth, style, ...rest } = this.props
    //console.log('row rendered')
    return (
      <div
        {...{
          key,
          style: { ...flexRowStyle({ rowWidth }), ...style },
          ...rest,
        }}
      >
        {this.props.children}
      </div>
    )
  }
}

export class FlexGridCell extends React.PureComponent {
  render() {
    //console.log('cell rendered')
    const {
      isSelected,
      isHovered,
      rowIndex,
      columnIndex,
      header,
      data,
      style,
      ...rest
    } = this.props
    return (
      <div
        {...{
          style: { ...flexCellStyle(header), ...style },
          ...rest,
        }}
      >
        {isHovered && '**'}
        {isSelected && '++'}
        {data[rowIndex][header.ident]}
      </div>
    )
  }
}

export class FlexGridColHeader extends React.PureComponent {
  render() {
    //console.log('header rendered')
    const { header, style, ...rest } = this.props
    return (
      <div
        {...{
          style: { ...flexCellStyle(header), ...style },
          ...rest,
        }}
      >
        {header.display}
      </div>
    )
  }
}

const flexGridRenderer = ({ data, headers, style, className }) => ({
  getColumnHeaderProps,
  getRowProps,
  getCellProps,
}) => (
  <div style={style} className={className}>
    {/* the header row */}
    <FlexGridRow {...getRowProps({ isHeader: true, headers })}>
      {headers.map((header, index) => (
        <FlexGridColHeader {...getColumnHeaderProps({ index, header })} />
      ))}
    </FlexGridRow>
    {/* table body */}
    {R.range(0, data.length).map(rowIndex => (
      <FlexGridRow {...getRowProps({ index: rowIndex, headers })}>
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
)
export default flexGridRenderer
