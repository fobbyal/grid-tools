import React from 'react'
import Downshift from 'downshift'
import PortaledPopper from '../PortaledPopper'
import styled from 'styled-components'
import { List } from 'react-virtualized'

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
  items,
}) => {
  const rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) => {
    const item = items[index]
    console.log('render cell')
    return (
      <div
        {...getItemProps({ item, index })}
        key={item}
        style={{
          ...style,
          backgroundColor: highlightedIndex === index ? 'gray' : 'white',
          fontWeight: selectedItem === item ? 'bold' : 'normal',
        }}
      >
        {item}
      </div>
    )
  }
  return (
    <List
      width={300}
      height={300}
      rowCount={items.length}
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
  items,
}) => (
  <div ref={ref} style={{ ...style, border: '1px solid #ccc' }}>
    {items
      .filter(
        i =>
          !inputValue ||
          inputValue.trim().length === 0 ||
          i.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map((item, index) => (
        <div
          {...getItemProps({ item })}
          key={item}
          style={{
            backgroundColor: highlightedIndex === index ? 'gray' : 'white',
            fontWeight: selectedItem === item ? 'bold' : 'normal',
          }}
        >
          {item}
        </div>
      ))}
  </div>
)

class DropDownCellEditor extends React.Component {
  handelInputRef = n => (this.input = n)

  state = { showSelection: false }

  componentDidMount() {
    // console.log('input is ', this.input)
    if (this.input) this.setState({ showSelection: true })
  }

  render() {
    const { items, onChange, width, height } = this.props
    const { showSelection } = this.state
    // TODO match min width of cell
    const renderList = items.length > 10 ? renderVirtualizedList : renderBasicList

    return (
      <Downshift
        onChange={onChange}
        render={({ getInputProps, ...downshiftProps }) => (
          <div>
            <input
              {...getInputProps({ placeholder: 'Favorite fruit ?' })}
              ref={this.handelInputRef}
            />
            {showSelection && (
              <PortaledPopper
                referenceElement={this.input}
                render={popperProps => renderList({ ...popperProps, ...downshiftProps, items })}
              />
            )}
          </div>
        )}
      />
    )
  }
}

export default DropDownCellEditor
