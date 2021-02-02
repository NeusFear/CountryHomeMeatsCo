import * as React from 'react';
window.React = React
import { render } from 'react-dom';
import { AppContainer } from './App';

render(React.createElement(AppContainer), document.getElementById("root"));