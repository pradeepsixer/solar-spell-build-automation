import axios from 'axios';
import React from 'react';

import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

import OpenInNew from 'material-ui-icons/OpenInNew';

import { DIRLAYOUT_SAVE_TYPE } from './constants.js';
import { APP_URLS, get_url } from './url.js';

class DirlayoutInfoBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.boardData.id,
            name: props.boardData.name,
            description: props.boardData.description,
            fieldErrors: {},
            confirmDelete: false,
            bannerFile: null,
            bannerFileName: props.boardData.original_file_name ? props.boardData.original_file_name : ''
        };
        this.handleTextFieldUpdate = this.handleTextFieldUpdate.bind(this);
        this.handleBannerSelection = this.handleBannerSelection.bind(this);
        this.saveDirLayout = this.saveDirLayout.bind(this);
        this.cloneDirLayout = this.cloneDirLayout.bind(this);
        this.deleteDirLayout = this.deleteDirLayout.bind(this);
        this.saveCallback = this.props.onSave.bind(this);
        this.deleteCallback = this.props.onDelete.bind(this);
        this.confirmDeleteDirLayout = this.confirmDeleteDirLayout.bind(this);
        this.closeConfirmDialog = this.closeConfirmDialog.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            id: props.boardData.id,
            name: props.boardData.name,
            description: props.boardData.description,
            fieldErrors: {},
            bannerFile: null,
            bannerFileName: props.boardData.original_file_name ? props.boardData.original_file_name : '',
            confirmDelete: false,
        });
    }

    handleTextFieldUpdate(stateProperty, evt) {
        const targetVal = evt.target.value;
        this.setState((prevState, props) => {
            const newState = {
                fieldErrors: prevState.fieldErrors,
                [stateProperty]: targetVal
            };
            newState.fieldErrors[stateProperty] = null;
            return newState;
        })
    }

    handleBannerSelection(evt) {
        evt.persist();
        const file = evt.target.files[0];
        this.setState({
            bannerFile: file,
            bannerFileName: file.name
        });
    }

    saveDirLayout(evt) {
        if (!this.is_valid_state()) {
            // If it is in an invalid state, do not proceed with the save operation.
            return;
        }
        var targetUrl = APP_URLS.DIRLAYOUT_LIST;
        const payload = new FormData();
        payload.append('name', this.state.name);
        payload.append('description', this.state.description);
        if (this.state.bannerFile) {
            payload.append('banner_file', this.state.bannerFile);
        }
        const currentInstance = this;
        if (this.state.id > 0) {
            // Update an existing directory layout.
            targetUrl = get_url(APP_URLS.DIRLAYOUT_DETAIL, {id:this.state.id});
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currentInstance.saveCallback(response.data, DIRLAYOUT_SAVE_TYPE.UPDATE);
            }).catch(function(error) {
                console.error("Error in updating the directory layout ", error);
                console.error(error.response.data);
            })
        } else {
            // Create a new directory layout.
            axios.post(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currentInstance.saveCallback(response.data, DIRLAYOUT_SAVE_TYPE.CREATE);
            }).catch(function(error) {
                console.error("Error in creating a new directory layout ", error);
                console.error(error.response.data);
            })
        }
    }

    is_valid_state() {
        var hasErrors = false;
        const fieldErrors = {};
        if (!this.state.name || this.state.name.trim().length === 0) {
            hasErrors = true;
            fieldErrors['name'] = 'Name is required.';
        }
        if (!this.state.description || this.state.description.trim().length === 0) {
            hasErrors = true;
            fieldErrors['description'] = 'Description is required.';
        }
        if (hasErrors) {
            this.setState({fieldErrors});
        }
        return !hasErrors;
    }

    cloneDirLayout(evt) {
        const targetUrl = get_url(APP_URLS.DIRLAYOUT_CLONE, {id: this.state.id});
        const currentInstance = this;
        axios.post(targetUrl, {}, {
            responseType: 'json'
        }).then(function(response) {
            currentInstance.saveCallback(response.data, DIRLAYOUT_SAVE_TYPE.CLONE);
        }).catch(function(error) {
            console.error("Error in cloning the directory layout", error);
            console.error(error.response.data);
        })
    }

    confirmDeleteDirLayout() {
        this.setState({
            confirmDelete: true
        })
    }

    deleteDirLayout() {
        const targetUrl = get_url(APP_URLS.DIRLAYOUT_DETAIL, {id:this.state.id});
        const currentInstance = this;
        axios.delete(targetUrl, {
            responseType: 'json'
        }).then(function(response) {
            currentInstance.deleteCallback(currentInstance.state.id);
        }).catch(function(error) {
            console.error("Error in deleting the directory layout ", error);
        })
    }

    closeConfirmDialog() {
        this.setState({confirmDelete: false})
    }

    render() {
        return (
            <div>
                <Button variant="raised" color="primary" onClick={this.saveDirLayout}>
                    Save
                </Button>
                {
                    this.state.id > 0 &&
                    <Button variant="raised" color="primary" onClick={this.cloneDirLayout}>
                    Clone
                    </Button>
                }
                {
                    this.state.id > 0 &&
                    <Button variant="raised" color="secondary" onClick={this.confirmDeleteDirLayout}>
                    Delete
                    </Button>
                }
                <TextField
                  id="name"
                  label="Name"
                  value={this.state.name}
                  required={true}
                  error={this.state.fieldErrors.name ? true : false}
                  onChange={evt => this.handleTextFieldUpdate('name', evt)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  id="description"
                  label="Description"
                  multiline
                  fullWidth
                  required={true}
                  error={this.state.fieldErrors.description ? true : false}
                  value={this.state.description}
                  onChange={evt => this.handleTextFieldUpdate('description', evt)}
                  margin="normal"
                />
                <TextField
                  id="bannerimg"
                  label="Banner Image"
                  multiline
                  disabled
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={this.state.fieldErrors.banner ? true : false}
                  value={this.state.bannerFileName}
                  margin="normal"
                />
                <input
                    accept="image/*"
                    className={'hidden'}
                    id="raised-button-file"
                    type="file"
                    onChange={ this.handleBannerSelection }
                 />
                <label htmlFor="raised-button-file">
                    <Button variant="raised" component="span">
                        Browse
                    </Button>
                </label>
                {
                    this.props.boardData.banner_file &&
                        <OpenInNew onClick={evt => window.open(this.props.boardData.banner_file, "_blank")}
                            className="handPointer" title="Open in new window"/>
                }
                <Dialog
                    open={this.state.confirmDelete}
                    onClose={this.closeConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete the directory layout {this.state.name}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeConfirmDialog} color="primary">
                            No
                        </Button>
                        <Button onClick={evt => {this.closeConfirmDialog(); this.deleteDirLayout();}} color="primary" autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

module.exports = DirlayoutInfoBoard;
