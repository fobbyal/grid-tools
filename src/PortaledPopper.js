import React from 'react'
import ReactDOM from 'react-dom'
import { Manager, Reference, Popper } from 'react-popper'
import PropTypes from 'prop-types'

/** Children : (Reference Render)
 ({ ref }) => (
        <button type="button" ref={ref}>
          Reference element
        </button>
      )
 */

/** PopperRender
 ({ ref, style, placement, arrowProps }) => (
        <div ref={ref} style={style} data-placement={placement}>
          Popper element
          <div ref={arrowProps.ref} style={arrowProps.style} />
        </div>
      )
 **/

class PortaledPopper extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    innerRef: PropTypes.func,
    modifiers: PropTypes.object.isRequired,
    placement: PropTypes.string.isRequired,
    eventsEnabled: PropTypes.bool,
    positionFixed: PropTypes.bool,
    popperRender: PropTypes.func.isRequired,
    popperVisible: PropTypes.bool,
    referenceInnerRef: PropTypes.func,
  }

  static defaultProps = {
    modifiers: {
      hide: { enabled: false },
      preventOverflow: { enabled: false },
    },
    placement: 'bottom-start',
    eventsEnabled: true,
    positionFixed: false,
    popperVisible: true,
  }

  constructor(props) {
    super(props)
    this.anchor = document.createElement('div')
    document.body.appendChild(this.anchor)
  }

  componentWillUnmount() {
    if (this.anchor) document.body.removeChild(this.anchor)
  }

  render() {
    const { children, popperRender, popperVisible, referenceInnerRef, ...popperProps } = this.props
    return (
      <Manager>
        <Reference innerRef={referenceInnerRef}>{children}</Reference>
        {popperVisible &&
          ReactDOM.createPortal(<Popper {...popperProps}>{popperRender}</Popper>, this.anchor)}
      </Manager>
    )
  }
}

export default PortaledPopper
