import React from 'react';
import ReactDOM from 'react-dom';

import CssBaseline from 'material-ui/CssBaseline';

import MainScreen from './main_screen.js';

ReactDOM.render(
    (<React.Fragment><CssBaseline />
    <MainScreen />
    </React.Fragment>)
    ,
    document.getElementById('container')
);