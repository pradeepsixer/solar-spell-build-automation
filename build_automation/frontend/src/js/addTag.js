import axios from 'axios';
import React from 'react';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';

import { APP_URLS, get_url } from './url.js';


class TagManagementComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            name: props.name,
            desc: props.desc
        };
        this.handleTextFieldUpdate = this.handleTextFieldUpdate.bind(this);
        this.saveTag = this.saveTag.bind(this);
        this.deleteTag = this.deleteTag.bind(this); 
    }

    handleTextFieldUpdate(stateProperty, evt) {
        this.setState({
            [stateProperty]: evt.target.value
        })
    }

    componentWillReceiveProps(props) {
        this.setState({
            name: props.name,
            desc: props.desc
            
        });
    }

    saveTag(evt) {
        var targetUrl = APP_URLS.TAG_LIST;
        const payload = {name: this.state.name, desc: this.state.desc};
        const currentInstance = this;
        if (this.state.id > 0) {
            // Update an existing Tag.
            targetUrl = get_url(APP_URLS.TAG_LIST, {name:this.state.name});
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currentInstance.saveCallback(response.data);
            }).catch(function(error) {
                console.error("Error in updating the Tag", error);
            })
        } else {
            // Create a new Tag.
            axios.post(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currentInstance.saveCallback(response.data, true);
            }).catch(function(error) {
                console.error("Error in creating a new Tag", error);
            })
        }
    }

    deleteTag(evt) {
        const targetUrl = get_url(APP_URLS.TAG_LIST, {name:this.state.name});
        const currentInstance = this;
        axios.delete(targetUrl, {
            responseType: 'json'
        }).then(function(response) {
            currentInstance.deleteCallback(currentInstance.state.name);
        }).catch(function(error) {
            console.error("Error in deleting the Tag", error);
        })
    }
 

    render() {
    return(
        <Grid container spacing={0}>
           <Grid item xs={8}>
          {this.props.title}
          </Grid>
        <Grid item xs={8}>
           
            <TextField
              id="name"
              label="Name"
              value={this.state.name}
              onChange={evt => this.handleTextFieldUpdate('name', evt)}
              fullWidth
              margin="normal"
            />
            <TextField
              id="desc"
              label="Description"
              value={this.state.desc}
              onChange={evt => this.handleTextFieldUpdate('desc', evt)}
              fullWidth
              margin="normal"
            />
            </Grid>
            
        </Grid>
    );
           
        
        
    }
}

module.exports = TagManagementComponent;