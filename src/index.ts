import { createElement } from 'react';
window.React = require('react')
import { render } from 'react-dom';
import { AppContainer } from './App';

render(createElement(AppContainer), document.getElementById("root"));