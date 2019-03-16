import React from 'react'
import DropdownCellEditor from '../../DropdownCellEditor'

class DropDownCellEditorDemo extends React.Component {
  state = { selected: this.props.choices[this.props.choices.length - 1].value }

  valueChanged = value => {
    // console.log('value changed to ', value)
    this.setState({ selected: value })
  }

  render() {
    const { selected } = this.state
    const { choices } = this.props
    return (
      <DropdownCellEditor
        virtualized
        choices={choices}
        value={selected}
        onChange={this.valueChanged}
      />
    )
  }
}

export default DropDownCellEditorDemo
