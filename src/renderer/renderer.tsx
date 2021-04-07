/**
 * Entry point
 */
// Import the styles here to process them with webpack
import '_public/style.css';
import '_fonts/fonts.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('app'));
