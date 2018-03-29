import React from 'react';
import ReactDOM from 'react-dom';

import CssBaseline from 'material-ui/CssBaseline';
import DirectoryLayoutComponent from './directory_layout.js';

ReactDOM.render(
    (<React.Fragment><CssBaseline /><DirectoryLayoutComponent /></React.Fragment>)
    ,
    document.getElementById('container')
);
