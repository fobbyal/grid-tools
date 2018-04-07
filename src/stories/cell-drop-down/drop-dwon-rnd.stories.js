import React from 'react'
import ClickExample from './ClickedPopper'
import PortaledPopperDemo from './PortalPopperDemo'
import DownshiftExample from './DownshiftExample'
import { action } from '@storybook/addon-actions'
import DropdownCellEditor from '../../DropdownCellEditor'
import R from 'ramda'

// ClickedPopper.js
import { storiesOf } from '@storybook/react'

storiesOf('DropDown RND')
  .add('Popper Doc Example', () => <ClickExample />)
  .add('Portaled Popper', () => <PortaledPopperDemo />)
  .add('Downshift doc example', () => (
    <DownshiftExample items={['one', 'two', 'three']} onChange={action('selected item:')} />
  ))
  .add('Dropdown Cell editor', () => (
    <DropdownCellEditor items={['one', 'two', 'three']} onChange={action('selected item:')} />
  ))
  .add('Virtualized Dropdown Cell editor', () => (
    <DropdownCellEditor
      items={R.range(1, 1000).map(i => i + ' abcd ')}
      onChange={action('selected item:')}
    />
  ))
