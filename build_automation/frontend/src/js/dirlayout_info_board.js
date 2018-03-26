import React from 'react';

class DirlayoutInfoBoard extends React.Component {
    render() {
        return <div style={{width: '60%', cssFloat: 'right', display: 'inline'}}> DirLayout Name : {this.props.boardData.name} </div>;
    }
}

module.exports = DirlayoutInfoBoard;
