import React from 'react'
import Grid from '../../index'

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
        <div
          style={{
            padding: '1em .5em',
          }}
        >
          <input type="text" value={fuzzyFilter} onChange={this.fuzzyFilterChanged} />
        </div>
        <Grid {...this.props} fuzzyFilter={fuzzyFilter} />
      </div>
    )
  }
}

export default FilterDemo
