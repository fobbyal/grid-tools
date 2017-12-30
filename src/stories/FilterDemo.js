import React from 'react'
import Grid, {
  flexGridRenderer,
  FlexCell,
  FlexColHeader,
  defaultFlexCellRenderer,
  defaultFlexColHeaderRenderer,
} from '../index'

class FilterDemo extends React.Component {
  state = {
    fuzzyFilter: '',
  }

  fuzzyFilterChanged = e => {
    const value = e.target.value
    this.setState(_ => ({
      fuzzyFilter: value,
    }))
  }

  render() {
    const { fuzzyFilter } = this.state
    return (
      <div>
        <div>
          <input
            type="text"
            value={fuzzyFilter}
            onChange={this.fuzzyFilterChanged}
          />
        </div>
        <Grid {...this.props} fuzzyFilter={fuzzyFilter} />
      </div>
    )
  }
}

export default FilterDemo
