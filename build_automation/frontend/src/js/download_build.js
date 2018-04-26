import React from 'react';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';

class DownloadBuild extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: props.build.name,
            currTime: props.build.currTime,
            download: props.build.download
        };
    }
    componentWillReceiveProps(props) {
        this.setState({
            name: props.build.name,
            currTime: props.build.currTime,
            download: props.build.download
        });
    }
    render(){

        return(
            <div>
                <label>Name</label>
                <TextField
                  id="name"
                  value={this.state.name || ''}
                  fullWidth
                  margin="normal"
                />

                <label>Date Created</label>
                <TextField
                  id="time"
                  fullWidth
                  value={this.state.currTime || ''}
                  margin="normal"
                />
                <Button variant="raised" color="primary" onClick={evt => window.open(this.state.download, "_blank")}>
                    Download Build
                </Button>
            </div>
        )
    }

}

module.exports = DownloadBuild