import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import ScrollSyncHelper from './ScrollSyncHelper'
import { SCROLL_SYNC_CONTEXT } from './constants'

class ScrollPane extends React.Component {
  static propTypes = {
    horizontal: PropTypes.bool,
    vertical: PropTypes.bool,
  }
  static defaultProps = {
    horizontal: true,
    vertical: false,
  }
  static contextTypes = {
    [SCROLL_SYNC_CONTEXT]: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const { horizontal, vertical } = this.props
    const scrollSync = this.context[SCROLL_SYNC_CONTEXT]
    const node = ReactDOM.findDOMNode(this.pane)
    if (horizontal) {
      scrollSync.registerPane(node, ScrollSyncHelper.HORIZONTAL)
    }
    if (vertical) {
      scrollSync.registerPane(node, ScrollSyncHelper.VERTICAL)
    }
    console.log(scrollSync)
  }

  componentWillUnmount() {
    const scrollSync = this.context[SCROLL_SYNC_CONTEXT]
    const node = ReactDOM.findDOMNode(this.pane)
    scrollSync.unReisterPane(node)
  }

  render() {
    const {
      children,
      // props that was passed down to figure out sytle
      vertical,
      horizontal,
      colCount,
      isHeader,
      scroll,
      xOffSet,
      yOffSet,
      headerRowHeight,
      showScroll,
      selectionType,
      ...props
    } = this.props
    return (
      <div ref={n => (this.pane = n)} {...props}>
        {children}
      </div>
    )
  }
}

export default ScrollPane
