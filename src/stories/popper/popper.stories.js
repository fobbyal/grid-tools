import React from 'react'
import ReactDOM from 'react-dom'
import { Manager, Reference, Popper } from 'react-popper'
import ClickExample from './ClickedPopper'

// ClickedPopper.js
import { storiesOf } from '@storybook/react'

class PortaledPopper extends React.Component {
  constructor(props) {
    super(props)
    this.anchor = document.createElement('div')
    document.body.appendChild(this.anchor)
  }

  componentWillUnmount() {
    if (this.anchor) document.body.removeChild(this.anchor)
  }

  render() {
    const { target } = this.props
    console.log('target is ', target)
    return ReactDOM.createPortal(
      <Popper
        referenceElement={target}
        placement="bottom-start"
        modifiers={{ hide: { enabled: false }, preventOverflow: { enabled: false } }}
      >
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
          </div>
        )}
      </Popper>,
      this.anchor
    )
  }
}

class Example extends React.Component {
  state = { showPopper: false }
  togglePopper = e => this.setState(({ showPopper }) => ({ showPopper: !showPopper }))

  handelRef = n => (this.node = n)

  render() {
    const { showPopper } = this.state
    return [
      <button key="btn" type="button" ref={this.handelRef} onClick={this.togglePopper}>
        Reference element
      </button>,
      showPopper ? <PortaledPopper target={this.node} key="popper" /> : null,
    ]
  }
}

storiesOf('Poppers')
  .add('Example 1', () => <Example />)
  .add('Clicked example', () => <ClickExample />)
