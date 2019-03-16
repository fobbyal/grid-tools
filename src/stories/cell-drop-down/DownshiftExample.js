import React from 'react'
import Downshift from 'downshift'

const BasicAutocomplete = ({ items, onChange }) => {
  // console.log('items', items)
  return (
    <Downshift onChange={onChange}>
      {({ getInputProps, getItemProps, isOpen, inputValue, selectedItem, highlightedIndex }) => (
        <div>
          <input {...getInputProps({ placeholder: 'Favorite fruit ?' })} />
          {isOpen ? (
            <div style={{ border: '1px solid #ccc' }}>
              {items
                .filter(i => !inputValue || i.toLowerCase().includes(inputValue.toLowerCase()))
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
          ) : null}
        </div>
      )}
    </Downshift>
  )
}

export default BasicAutocomplete
