import axios from 'axios';
import React from 'react';

import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';

import { APP_URLS, get_url } from './url.js';

class MakeBuildDirlayoutInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: props.info.id,
            name: props.info.name,
            description: props.info.description,
            currTime: null,
            data:{},
            message: null,
            messageType: 'info',
            confirmBuild: false
        };
        this.buildHandler = this.buildHandler.bind(this);
        this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this);
        this.confirmBuildDirectory = this.confirmBuildDirectory.bind(this);
        this.closeConfirmDialog = this.closeConfirmDialog.bind(this);
    }

     componentWillReceiveProps(props) {
        this.setState({
            id: props.info.id,
            name: props.info.name,
            description: props.info.description,
            confirmBuild: false,
        });
    }

    buildHandler(evt){
        const url = get_url(APP_URLS.START_BUILD, {id: this.state.id});
        const currentInstance = this;
        axios.post(url, {}, {
            responseType: 'json'
        }).then(function(response) {
            if(response.data.status == "successful"){
                currentInstance.setState({
                    message: 'Build started successfully',
                    messageType: 'info'
                });
            }

        }).catch(function(error) {
             if(error.response.data.status && error.response.data.status == "failure"){
                currentInstance.setState({
                    message: error.response.data.message,
                    messageType: 'error'
                });
            }
            else{
                currentInstance.setState({
                        message: 'There is an error while starting the build',
                        messageType: 'error'
                    });
            }
        })
    }

    confirmBuildDirectory() {
        this.setState({
            confirmBuild: true
        })
    }
    closeConfirmDialog() {
        this.setState({confirmBuild: false})
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

                <label>Description</label>
                <TextField
                  id="description"
                  multiline
                  fullWidth
                  value={this.state.description || ''}
                  margin="normal"
                />
                <Button variant="raised" color="primary" onClick={this.confirmBuildDirectory}>
                    Start Build
                </Button>
                <Dialog
                    open={this.state.confirmBuild}
                    onClose={this.closeConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirm Build?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to build the {this.state.name} library version?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeConfirmDialog} color="primary">
                            No
                        </Button>
                        <Button onClick={evt => {this.closeConfirmDialog(); this.buildHandler();}} color="primary" autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={Boolean(this.state.message)}
                    onClose={this.handleCloseSnackbar}
                    message={<span>{this.state.message}</span>}
                    SnackbarContentProps={{
                        "style": this.getErrorClass()
                    }}
                />
            </div>
        )
    }

    getErrorClass() {
        return this.state.messageType === "error" ? {backgroundColor: '#B71C1C', fontWeight: 'normal'} : {};
    }

    handleCloseSnackbar() {
        this.setState({
            message: null,
            messageType: 'info'
        })
    }
}

module.exports = MakeBuildDirlayoutInfo