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
    <VirtualizedList
      width={minWidth}
      height={250}
      rowCount={visibleChoices.length}
      rowHeight={30}
      rowRenderer={rowRenderer}
      scrollToIndex={justOpened && index >= 0 ? index : undefined}
    />
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
}) => (
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

class DropDownCellEditor extends React.Component {
  handelInputRef = node => {
    console.log('inner ref method is', this.props.innerRef)
    this.input = node
    console.log('inner ref method is', this.props.innerRef)
    if (this.props.innerRef) {
      this.props.innerRef(node)
    }
  }

  state = { showSelection: false, justOpened: true }

  componentDidMount() {
    // console.log('input is ', this.input)
    if (this.input) this.setState({ showSelection: true })
  }

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
      onBlur,
    } = this.props
    const { showSelection, justOpened } = this.state
    // TODO match min width of cell
    const isLongList = choices.length > 10
    const renderList = isLongList ? renderVirtualizedList : renderBasicList

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
            {isLongList ? (
              <input
                {...getInputProps({ placeholder })}
                ref={this.handelInputRef}
                style={{ ...style, width: width + 'px', height: height + 'px' }}
                onBlur={onBlur}
                className={className}
              />
            ) : (
              <button
                {...getToggleButtonProps()}
                ref={this.handelInputRef}
                style={{ ...style, width: width + 'px', height: height + 'px' }}
                onBlur={onBlur}
                className={className}
              >
                {downshiftProps.selectedItem
                  ? downshiftProps.selectedItem.text || downshiftProps.selectedItem.value
                  : placeholder || 'Select a value'}
              </button>
            )}
            {showSelection && (
              <PortaledPopper
                referenceElement={this.input}
                render={popperProps =>
                  renderList({
                    ...popperProps,
                    ...downshiftProps,
                    choices,
                    minWidth: width,
                    justOpened,
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
