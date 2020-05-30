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
  choices,
  minWidth,
  justOpened,
  // placement,
  // arrowProps,
}) => {
  if (process.env.NODE_ENV === 'development') console.log('rendering virtualized list here..')
  // console.log('virtualized style is ', style)

  const visibleChoices = justOpened ? choices : choices.filter(matchesInput(inputValue))

  const rowRenderer = ({
    index, // Index of row within collection
    style, // Style object to be applied to row (to position it)
    // key, // Unique key within array of rows
    // isScrolling, // The List is currently being scrolled
    // isVisible, // This row is visible within the List (eg it is not an overscanned row)
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
    <div ref={ref} style={{ ...style, zIndex: 100000 }}>
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
  selectedItem,
  highlightedIndex,
  ref,
  style,
  choices,
  minWidth,
  // inputValue,
  // placement,
  // arrowProps,
}) => {
  // console.log('basic list style is ', style)
  return (
    <BasicList innerRef={ref} style={{ ...style, minWidth: minWidth + 'px', zIndex: 100000 }}>
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
  handelListRef = node => {
    this.list = node
    // console.log('list is', node)
  }

  handleBlur = e => {
    // console.log('blur is ', e)
    const { virtualized, onBlur } = this.props
    if (!virtualized) {
      onBlur && onBlur(e)
    } else {
      if (!e.relatedTarget || e.relatedTarget.getAttribute('id') !== 'drop-down-vr-list') {
        onBlur && onBlur(e)
      }
    }
  }

  state = { showSelection: true, justOpened: true }

  inputValueChanged = value => {
    // console.log('value changed to ', value)
    const { acceptRawText, valueChanged } = this.props
    if (acceptRawText) {
      valueChanged(value)
    }
    this.setState({ justOpened: false })
  }

  renderInput = ({
    getInputProps,
    placeholder,
    onKeyDown,
    style = {},
    className,
    width = 150,
    height = 25,
    handleRef,
  }) => (
    <input
      {...getInputProps({ placeholder, onKeyDown })}
      ref={handleRef}
      style={{ ...style, width: width + 'px', height: height + 'px' }}
      onBlur={this.handleBlur}
      className={className}
    />
  )
  // innerRef={ref}

  renderComboBox = ({
    getToggleButtonProps,
    placeholder,
    onKeyDown,
    selectedItem,
    style = {},
    className,
    width = 150,
    height = 25,
    handleRef,
  }) => (
    <ComboSelector
      innerRef={handleRef}
      {...getToggleButtonProps({ onKeyDown })}
      style={{ ...style, width: width + 'px', height: height + 'px' }}
      onBlur={this.handleBlur}
      className={className}
    >
      {selectedItem ? selectedItem.text || selectedItem.value : placeholder || 'Select a value'}
    </ComboSelector>
  )

  render() {
    const { choices, value, onChange, virtualized, zIndex, acceptRawText } = this.props
    // eslint-disable-next-line standard/object-curly-even-spacing
    const { /* showSelection, */ justOpened } = this.state
    const renderList = virtualized ? renderVirtualizedList : renderBasicList
    const renderSelector = virtualized || acceptRawText ? this.renderInput : this.renderComboBox

    const selectedItem = R.find(c => value === c.value, choices)
    const hilightedIndex = R.findIndex(c => value === c.value, choices)

    return (
      <Downshift
        defaultSelectedItem={selectedItem}
        defaultHighlightedIndex={hilightedIndex}
        onInputValueChange={this.inputValueChanged}
        onChange={onChange}
        // eslint-disable-next-line standard/object-curly-even-spacing
        itemToString={({ /* value, */ text }) => text || value + ''}
      >
        {downshiftProps => (
          <div>
            <PortaledPopper
              popperVisible
              referenceInnerRef={this.props.innerRef}
              popperRender={popperProps =>
                renderList({
                  ...downshiftProps,
                  ...popperProps,
                  choices,
                  minWidth: this.props.width == null ? 150 : this.props.width,
                  justOpened,
                  ref: popperProps.ref,
                  zIndex,
                })
              }
            >
              {({ ref }) =>
                renderSelector({
                  ...this.props,
                  ...downshiftProps,
                  handleRef: ref,
                })
              }
            </PortaledPopper>
          </div>
        )}
      </Downshift>
    )
  }
}

export default DropDownCellEditor
