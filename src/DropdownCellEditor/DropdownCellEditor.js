import React from 'react'
import Downshift from 'downshift'
import PortaledPopper from '../PortaledPopper'
import styled from 'styled-components'
import { List } from 'react-virtualized'
import R from 'ramda'

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
}) => {
  if (process.env.NODE_ENV === 'development') console.log('rendering virtualized list here..')

  const visibleChoices = choices.filter(matchesInput(inputValue))

  const rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) => {
    const item = visibleChoices[index]
    // console.log('render cell')
    return (
      <div
        {...getItemProps({ item, index })}
        key={item.value}
        style={{
          ...style,
          backgroundColor: highlightedIndex === index ? 'gray' : 'white',
          fontWeight: selectedItem === item ? 'bold' : 'normal',
        }}
      >
        {item.text || item.value}
      </div>
    )
  }
  console.log('min width is ', visibleChoices.length)

  return (
    <List
      width={300}
      height={240}
      rowCount={visibleChoices.length}
      rowHeight={20}
      rowRenderer={rowRenderer}
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
  <div ref={ref} style={{ ...style, minWidth: minWidth + 'px', border: '1px solid #ccc' }}>
    {choices
      // .filter(matchesInput(inputValue))
      .map((item, index) => (
        <div
          {...getItemProps({ item, index })}
          key={item.value}
          style={{
            backgroundColor: highlightedIndex === index ? 'gray' : 'white',
            fontWeight: selectedItem === item ? 'bold' : 'normal',
          }}
        >
          {item.text || item.value}
        </div>
      ))}
  </div>
)

class DropDownCellEditor extends React.Component {
  handelInputRef = n => (this.input = n)

  state = { showSelection: false, initialState: true }

  componentDidMount() {
    // console.log('input is ', this.input)
    if (this.input) this.setState({ showSelection: true })
  }

  inputValueChanged = value => {
    console.log('value changed to ', value)
    this.setState({ initialState: false })
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
    } = this.props
    const { showSelection } = this.state
    // TODO match min width of cell
    const isLongList = choices.length > 10
    const renderList = isLongList ? renderVirtualizedList : renderBasicList

    const selectedItem = R.find(c => value === c.value, choices)

    return (
      <Downshift
        defaultSelectedItem={selectedItem}
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
                className={className}
              />
            ) : (
              <button
                {...getToggleButtonProps()}
                ref={this.handelInputRef}
                style={{ ...style, width: width + 'px', height: height + 'px' }}
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
                  renderList({ ...popperProps, ...downshiftProps, choices, minWidth: width })
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
