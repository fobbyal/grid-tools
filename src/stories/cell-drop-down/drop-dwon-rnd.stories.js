import React from 'react'
import ClickExample from './ClickedPopper'
import PortaledPopperDemo from './PortalPopperDemo'
import DownshiftExample from './DownshiftExample'
import { action } from '@storybook/addon-actions'
import DropdownCellEditor from '../../DropdownCellEditor'
import DropdownCellEditorDemo from './DropdownCellEditorDemo'
import Chance from 'chance'
import styled from 'styled-components'

// ClickedPopper.js
import { storiesOf } from '@storybook/react'

const chance = new Chance()

// console.log('chance is ', chance)

const Content = styled.div`
  width: 100vw;
  height: 100vh;
`

const virtualiedChoices = chance
  .unique(() => chance.word({ syllables: 4 }), 1000)
  .map((text, value) => ({ value, text }))

const normalChoices = chance
  .unique(() => chance.word({ syllables: 4 }), 9)
  .map((text, value) => ({ value, text }))

storiesOf('DropDown RND', module)
  .add('Popper Doc Example', () => <ClickExample />)
  .add('Portaled Popper', () => <PortaledPopperDemo />)
  .add('Downshift doc example', () => (
    <DownshiftExample items={['one', 'two', 'three']} onChange={action('selected item:')} />
  ))
  .add('Dropdown Cell editor', () => (
    <DropdownCellEditor choices={normalChoices} onChange={action('selected item:')} />
  ))
  .add('Virtualized Dropdown Cell editor', () => (
    <Content>
      <DropdownCellEditorDemo choices={virtualiedChoices} />
    </Content>
  ))
