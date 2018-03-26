import React from 'react';

class DirectoryInfoBoard extends React.Component {
    render() {
        return <div style={{width: '60%', cssFloat: 'right', display: 'inline'}}> Directory Name : {this.props.boardData.title} </div>;
    }
}

module.exports = DirectoryInfoBoard;
