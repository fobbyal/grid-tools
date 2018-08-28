import React from 'react'
import Downshift from 'downshift'
import PortaledPopper from '../PortaledPopper'
import styled from 'styled-components'
import { List } from 'react-virtualized'
import R from 'ramda'

const listContainerStyle = `
  border: solid 1px #ccc;
  border-radius: 3px;
  background-color: white;
`

const VirtualizedList = styled(List)`
  ${listContainerStyle};
`

const BasicList = styled.div`
  ${listContainerStyle};
  min-height: 30px;
`

const Item = styled.div`
  font-weight: ${props => (props.selected ? 'bold' : 'normal')};
  color: ${props => (props.selected ? 'brown' : 'initial')};
  background-color: ${props => (props.hilighted ? '#eee' : 'initial')};
  padding: 4px 0.3em;
  cursor: pointer;
`

const ComboSelector = styled.button`
  background-color: white;
  border: 1px solid black;
`

// TODO: think about values that may be other primitives
const partialMatch = (a, b) =>
  !R.isNil(a) &&
  !R.isNil(b) &&
  typeof a === 'string' &&
  typeof b === 'string' &&
  a.toLowerCase().includes(b.toLowerCase())

const matchesInput = inputValue => ({ value, text }) =>
  !inputValue ||
  inputValue.trim().length === 0 ||
  partialMatch(value, inputValue) ||
  partialMatch(text, inputValue)

const renderListItem = ({ getItemProps, style, item, index, selectedItem, highlightedIndex }) => (
  <Item
    {...getItemProps({ item, index })}
    key={item.value}
    style={style}
    selected={selectedItem === item}
    hilighted={highlightedIndex === index}
    data-testid="grid-cell-dropdown-item"
  >
    {item.text || item.value}
  </Item>
)

const renderVirtualizedList = ({
  getItemProps,
  /* isOpen, */
  inputValue,
  selectedItem,
  highlightedIndex,
  ref,
  style,
  placement,
  arrowProps,
  choices,
  minWidth,
  justOpened,
}) => {
  if (process.env.NODE_ENV === 'development') console.log('rendering virtualized list here..')
  console.log('virtualized style is ', style)

  const visibleChoices = justOpened ? choices : choices.filter(matchesInput(inputValue))

  const rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) => {
    return renderListItem({
      getItemProps,
      style,
      item: visibleChoices[index],
      index,
      selectedItem,
      highlightedIndex,
    })
  }
  // console.log('min width is ', visibleChoices.length)
  const index = R.findIndex(a => a === selectedItem, visibleChoices)

  return (
    <div ref={ref} style={style}>
      <VirtualizedList
        width={minWidth}
        height={250}
        rowCount={visibleChoices.length}
        rowHeight={30}
        rowRenderer={rowRenderer}
        scrollToIndex={justOpened && index >= 0 ? index : undefined}
        id="drop-down-vr-list"
      />
    </div>
  )
}

const renderBasicList = ({
  getItemProps,
  /* isOpen, */
  inputValue,
  selectedItem,
  highlightedIndex,
  ref,
  style,
  placement,
  arrowProps,
  choices,
  minWidth,
}) => {
  console.log('basic list style is ', style)
  return (
    <BasicList innerRef={ref} style={{ ...style, minWidth: minWidth + 'px' }}>
      {choices.map((item, index) =>
        renderListItem({
          getItemProps,
          item,
          index,
          selectedItem,
          highlightedIndex,
        })
      )}
    </BasicList>
  )
}

class DropDownCellEditor extends React.Component {
  handelInputRef = node => {
    this.input = node
    if (this.props.innerRef) {
      this.props.innerRef(node)
    }
    this.setState({ showSelection: true })
  }

  handelListRef = node => {
    this.list = node
    console.log('list is', node)
  }

  handleBlur = e => {
    console.log('blur is ', e)
    const { virtualized, onBlur } = this.props
    if (!virtualized) {
      onBlur(e)
    } else {
      if (!e.relatedTarget || e.relatedTarget.getAttribute('id') !== 'drop-down-vr-list') {
        onBlur(e)
      }
    }
  }

  state = { showSelection: false, justOpened: true }

  inputValueChanged = value => {
    console.log('value changed to ', value)
    this.setState({ justOpened: false })
  }

  render() {
    const {
      className,
      style = {},
      choices,
      value,
      onChange,
      width = 150,
      height = 25,
      placeholder,
      onKeyDown,
      virtualized,
    } = this.props
    const { showSelection, justOpened } = this.state
    const renderList = virtualized ? renderVirtualizedList : renderBasicList

    const selectedItem = R.find(c => value === c.value, choices)
    const hilightedIndex = R.findIndex(c => value === c.value, choices)

    return (
      <Downshift
        defaultSelectedItem={selectedItem}
        defaultHighlightedIndex={hilightedIndex}
        onInputValueChange={this.inputValueChanged}
        onChange={onChange}
        itemToString={({ vallue, text }) => text || value + ''}
        render={({ getInputProps, getToggleButtonProps, ...downshiftProps }) => (
          <div>
            {virtualized ? (
              <input
                {...getInputProps({ placeholder, onKeyDown })}
                ref={this.handelInputRef}
                style={{ ...style, width: width + 'px', height: height + 'px' }}
                onBlur={this.handleBlur}
                className={className}
              />
            ) : (
              <ComboSelector
                {...getToggleButtonProps({ onKeyDown })}
                innerRef={this.handelInputRef}
                style={{ ...style, width: width + 'px', height: height + 'px' }}
                onBlur={this.handleBlur}
                className={className}
              >
                {downshiftProps.selectedItem
                  ? downshiftProps.selectedItem.text || downshiftProps.selectedItem.value
                  : placeholder || 'Select a value'}
              </ComboSelector>
            )}
            {showSelection && (
              <PortaledPopper
                referenceElement={this.input}
                render={popperProps =>
                  renderList({
                    ...downshiftProps,
                    ...popperProps,
                    choices,
                    minWidth: width,
                    justOpened,
                    ref: popperProps.ref,
                  })
                }
              />
            )}
          </div>
        )}
      />
    )
  }
}

export default DropDownCellEditor
