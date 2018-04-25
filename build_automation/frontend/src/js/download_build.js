import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class DownloadBuild extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: props.build.name,
            currTime: props.build.currTime,
            download: props.build.download
        };
      //  this.handleDownloadBuild = this.handleDownloadBuild.bind(this);
    }

    /*handleDownloadBuild(evt){
        //call api
        console.log("Download");
    }*/

    componentWillReceiveProps(props) {
        console.log(props.build)
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