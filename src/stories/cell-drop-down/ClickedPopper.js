import React, { PureComponent } from 'react'
import { Popper, Arrow } from 'react-popper'

class StandaloneExample extends PureComponent {
  state = {
    isOpen: false,
  }

  handleClick = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
    }))
  }

  render() {
    return (
      <div>
        <h2>Standalone Popper Example</h2>
        <div
          ref={div => (this.target = div)}
          style={{ width: 120, height: 120, background: '#b4da55' }}
          onClick={this.handleClick}
        >
          Click {this.state.isOpen ? 'to hide' : 'to show'} popper
        </div>
        {this.state.isOpen && (
          <Popper className="popper" referenceElement={this.target}>
            {({ ref, style, placement, arrowProps }) => (
              <div ref={ref} style={style} data-placement={placement}>
                <ul>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                  <li>Popper element aseaseafef</li>
                </ul>
                <div ref={arrowProps.ref} style={arrowProps.style} />
              </div>
            )}
          </Popper>
        )}
      </div>
    )
  }
}

export default StandaloneExample
