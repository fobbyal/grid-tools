import React from 'react'
import ReactDOM from 'react-dom'
import { Popper } from 'react-popper'
import PropTypes from 'prop-types'

/**
 * This is a simple wrapper class for the popper to be out of context
 * so there are no z-index/overflow issues
 * /

/** render should look like the following based on react popper docs
 * https://github.com/souporserious/react-popper
   const defaultRender = ({ ref, style, placement, arrowProps }) => (
     <div ref={ref} style={style} data-placement={placement}>
       propert content
     </div>
   )
**/
class PortaledPopper extends React.Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    modifiers: PropTypes.object.isRequired,
    placement: PropTypes.string.isRequired,
  }

  static defaultProps = {
    modifiers: {
      hide: { enabled: false },
      preventOverflow: { enabled: false },
    },
    placement: 'bottom-start',
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
    const { render, ...rest } = this.props
    console.log('rendering here...', this.anchor)
    return ReactDOM.createPortal(<Popper {...rest}>{render}</Popper>, this.anchor)
  }
}

export default PortaledPopper
