import axios from 'axios';
import React from 'react';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';

import { APP_URLS, get_url } from './url.js';

class DirlayoutInfoBoard extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            id: props.boardData.id,
            name: props.boardData.name,
            description: props.boardData.description
        };
        this.handleTextFieldUpdate = this.handleTextFieldUpdate.bind(this);
        this.saveDirLayout = this.saveDirLayout.bind(this);
        this.cloneDirLayout = this.cloneDirLayout.bind(this);
        this.deleteDirLayout = this.deleteDirLayout.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            id: props.boardData.id,
            name: props.boardData.name,
            description: props.boardData.description
        });
    }

    handleTextFieldUpdate(stateProperty, evt) {
        this.setState({
            [stateProperty]: evt.target.value
        })
    }

    saveDirLayout(evt) {
        var targetUrl = APP_URLS.DIRLAYOUT_LIST;
        const payload = {name: this.state.name, description: this.state.description};
        if (this.state.id > 0) {
            // Update an existing directory layout.
            targetUrl = get_url(APP_URLS.DIRLAYOUT_DETAIL, {id:this.state.id});
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                console.log(response.status, response.statusText);
                console.log(response.data);
                // TODO: Use the props' savecallback to notify successful addition
            }).catch(function(error) {
                console.error(error);
            })
        } else {
            // Create a new directory layout.
            axios.post(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                console.log(response.status, response.statusText);
                console.log(response.data);
                // TODO: Use the props' savecallback to notify successful updation
            }).catch(function(error) {
                console.error(error);
            })
        }
    }

    cloneDirLayout(evt) {
        console.log("Need to clone the directory layout");
    }

    deleteDirLayout(evt) {
        // TODO : First confirm the delete action.
        const targetUrl = get_url(APP_URLS.DIRLAYOUT_DETAIL, {id:this.state.id});
        axios.delete(targetUrl, {
            responseType: 'json'
        }).then(function(response) {
            console.log(response.status, response.statusText);
            console.log(response.data);
            // TODO: Use the props' savecallback to notify successful deletion
        }).catch(function(error) {
            console.log(error);
        })
    }

    render() {
        return (
            <div style={{width: '60%', cssFloat: 'right', display: 'inline'}}>
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
                    <Button variant="raised" color="secondary" onClick={this.deleteDirLayout}>
                    Delete
                    </Button>
                }
                <input type="hidden" value={this.state.id} />
                <TextField
                  id="name"
                  label="Name"
                  value={this.state.name}
                  onChange={evt => this.handleTextFieldUpdate('name', evt)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  id="description"
                  label="Description"
                  multiline
                  fullWidth
                  value={this.state.description}
                  onChange={evt => this.handleTextFieldUpdate('description', evt)}
                  margin="normal"
                />
            </div>
        );
    }
}

module.exports = DirlayoutInfoBoard;
