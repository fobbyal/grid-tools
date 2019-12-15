import React from 'react'
import styled from 'styled-components'
import DropdownCellEditor from './DropdownCellEditor'

const mapAlignmentToJustifyContent = alignment =>
  alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : alignment

const cellColorOf = props => {
  const { isSelected, isHovered } = props
  const hoverSelectionColor = props.hoverSelectionColor || 'white'
  const hoverColor = props.hoverColor || 'unset'
  const selectionColor = props.selectionColor || '#efefef'
  const color = props.color || 'unset'
  return isHovered && isSelected
    ? hoverSelectionColor
    : isSelected
    ? selectionColor
    : isHovered
    ? hoverColor
    : color
}
const cellBgColorOf = props => {
  const backgroundColor = props.backgroundColor || 'unset'
  const hoverSelectionBackgroundColor = props.hoverSelectionBackgroundColor || '#333'
  const hoverBackgroundColor = props.hoverBackgroundColor || '#ddd'
  const selectionBackgroundColor = props.selectionBackgroundColor || '#666'

  return props.isHovered && props.isSelected
    ? hoverSelectionBackgroundColor
    : props.isHovered
    ? hoverBackgroundColor
    : props.isSelected
    ? selectionBackgroundColor
    : backgroundColor
}

/* prettier-ignore */
export const BasicCell = styled.div`
  display: flex;
  border-left: 1px solid #ccc;
  align-items: center;
  user-select: none;
  cursor: default;
  justify-content: ${props =>
    mapAlignmentToJustifyContent(props.alignment) || 'center'};
  ${props => `font-size: ${ props.fontSize||'unset' };` }
  ${props =>`color: ${cellColorOf(props)};` }
  ${props =>`background-color:${cellBgColorOf(props)};` }
  ${props => `font-weight: ${ props.fontWeight ||'normal' };` }
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
  background-color: ${props => props.backgroundColor};
  color: ${props => props.color || 'white'};
  line-height: 1.3em;
  font-weight: ${props => props.fontWeight || 'bold'};
  font-size: ${props => props.fontSize || '0.85em'};
  padding-left: 0.5em;
  padding-right: 0.5em;
  padding-top: 0.3em;
  padding-bottom: 0.3em;
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

export const inputCellEditRender = ({ getInputProps }) => (
  <CellInputEditor {...getInputProps({ refKey: 'innerRef' })} />
)

export const dropdownEditRender = ({ getDropdownProps }) => (
  <DropdownCellEditor {...getDropdownProps({ refKey: 'innerRef' })} />
)
export const CellInputEditor = BasicCellInput.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  max-width: ${props => props.width}px;
`
