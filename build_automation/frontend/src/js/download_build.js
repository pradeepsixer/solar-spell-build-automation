import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class DownloadBuild extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: props.build.id,
            name: props.build.name,
            description: props.build.description,
            currTime: props.build.currTime,
        };
        this.handleDownloadBuild = this.handleDownloadBuild.bind(this);
    }

    handleDownloadBuild(evt){
        //call api
        console.log("Download");
    }

    render(){

        return(
            <div>
                <label>Name</label>
                <TextField
                  id="name"
                  value={this.state.name}
                  fullWidth
                  margin="normal"
                />

                <label>Description</label>
                <TextField
                  id="description"
                  multiline
                  fullWidth
                  value={this.state.description}
                  margin="normal"
                />

                <label>Date Created</label>
                <TextField
                  id="time"
                  multiline
                  fullWidth
                  value={this.state.currTime}
                  margin="normal"
                />
                <Button variant="raised" color="primary" onClick={this.handleDownloadBuild}>
                    Download Build
                </Button>
            </div>
        )
    }

}

module.exports = DownloadBuild