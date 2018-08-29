import { configure } from '@storybook/react'
import 'react-virtualized/styles.css'

const req = require.context('../src/stories', true, /.stories.js$/)

function loadStories() {
  req.keys().forEach(filename => req(filename))
  //require('../src/stories')
}

configure(loadStories, module)
