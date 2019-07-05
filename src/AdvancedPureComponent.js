import React from 'react'
// import shallowCompare from 'react-addons-shallow-compare'
import shallowEqual from 'fbjs/lib/shallowEqual'

const createAdvancedPureComponent = (Component, toFlattenProps = _ => _) => {
  const AdvancedPureComponent = class extends React.Component {
    shouldComponentUpdate(nextProps) {
      return !shallowEqual(toFlattenProps(this.props), toFlattenProps(nextProps))
    }
    render() {
      const { children, ...props } = this.props
      return <Component {...props}>{children}</Component>
    }
  }

  AdvancedPureComponent.displayName = `AdvancedPureComponent(${Component.displayName})`

  return AdvancedPureComponent
}

export default createAdvancedPureComponent
