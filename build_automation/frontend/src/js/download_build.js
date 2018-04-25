import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class DownloadBuild extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            name: props.build.name,
            currTime: props.build.end_time,
            download: props.build.build_file
        };
      //  this.handleDownloadBuild = this.handleDownloadBuild.bind(this);
    }

    /*handleDownloadBuild(evt){
        //call api
        console.log("Download");
    }*/

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
                <Button variant="raised" color="primary" onClick={evt => window.open(this.state.download, "_blank")}>
                    Download Build
                </Button>
            </div>
        )
    }

}

module.exports = DownloadBuild