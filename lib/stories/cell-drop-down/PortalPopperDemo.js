import React from 'react'
import PortaledPopper from '../../PortaledPopper'

class Example extends React.Component {
  state = { showPopper: false }
  togglePopper = e => this.setState(({ showPopper }) => ({ showPopper: !showPopper }))

  handelRef = n => (this.node = n)

  render() {
    const { showPopper } = this.state
    return [
      <div key="btn" type="button" ref={this.handelRef} onClick={this.togglePopper}>
        Reference element
      </div>,
      showPopper ? (
        <PortaledPopper
          referenceElement={this.node}
          render={({ ref, style, placement, arrowProps }) => (
            <div ref={ref} style={style} data-placement={placement}>
              <div>row1row1row1row1row1row1</div>
              <div>row1row1row1row1row1row2</div>
              <div>row1row1row1row1row1row3</div>
              <div>row1row1row1row1row1row4</div>
              <div>row1row1row1row1row1row5</div>
            </div>
          )}
          key="popper"
        />
      ) : null,
    ]
  }
}
export default Example
