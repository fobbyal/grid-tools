import React from 'react'
import Downshift from 'downshift'

const DropDownCellEditor = ({ items, onChange }) => {
  return (
    <Downshift
      onChange={onChange}
      render={({
        getInputProps,
        getItemProps,
        isOpen,
        inputValue,
        selectedItem,
        highlightedIndex,
      }) => [
        <input key="input" {...getInputProps({ placeholder: 'Favorite fruit ?' })} />,

        <div key="poppedItem" style={{ border: '1px solid #ccc' }}>
          {items
            // .filter(
            //   i =>
            //     !inputValue ||
            //     inputValue.trim().length === 0 ||
            //     i.toLowerCase().includes(inputValue.toLowerCase())
            // )
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
        </div>,
      ]}
    />
  )
}

export default DropDownCellEditor
