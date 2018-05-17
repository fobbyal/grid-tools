import styled from 'styled-components'

const mapAlignmentToJustifyContent = alignment =>
  alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : alignment

/* prettier-ignore */
export const BasicCell = styled.div`
  display: flex;
  border-left: 1px solid #ccc;
  align-items: center;
  user-select: none;
  cursor: default;
  justify-content: ${props =>
    mapAlignmentToJustifyContent(props.alignment) || 'center'};
  ${props => (props.fontSize ? 'font-size:' + props.fontSize + ';' : '')}
  ${props =>
    props.isSelected && props.isHovered ?
      'color:white;':
    props.isSelected && !props.isHovered
      ? 'color: #efefef;'
      : props.color ? 'color:' + props.color + ';' : ''}
  ${props =>
    props.isHovered && props.isSelected ? 
      'background-color:#333;':
    props.isHovered
      ? 'background-color:#ddd;'
      : props.isSelected
        ? 'background-color:#666;'
        : props.backgroundColor
          ? 'background-color:' + props.backgroundColor + ';'
          : ''}
  ${props => (props.fontWeight ? 'font-weight:' + props.fontWeight + ';' : '')}
  padding-left: 0.2em;
  padding-right: 0.2em;
`

/* prettier-ignore */
export const BasicCellInput = styled.input`
  border: 2px solid black;
  text-align: ${props => props.alignment};
  ${props => (props.fontSize ? 'font-size:' + props.fontSize + ';' : '')}
  ${props => (props.fontWeight ? 'font-weight:' + props.fontWeight + ';' : '')}
  padding-left: 0.2em;
  padding-right: 0.2em;
`

export const BasicColHeader = styled.div`
  border-right: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  user-select: none;
  cursor: ${props => (props.sortable ? 'pointer' : 'default')};
  background-color: ${props => props.backgroundColor || 'steelblue'};
  color: ${props => props.color || 'white'};
  font-weight: ${props => props.fontWeight || 'bold'};
  font-size: ${props => props.fontSize || '0.85em'};
  &:first-child {
    border-left: 1px solid steelblue;
    border-top-left-radius: 3px;
  }
  &:last-child {
    ${props => !props.scrollY && 'border-top-right-radius: 3px;'};
  }
`

export const SortIndicator = styled.i`
  justify-self: flex-end;
  margin-left: 0.2em;
`
