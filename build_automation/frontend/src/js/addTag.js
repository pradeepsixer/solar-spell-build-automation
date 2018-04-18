import axios from 'axios';
import React from 'react';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';

import { APP_URLS, get_url } from './url.js';

import Typography from 'material-ui/Typography';
import { TAG_SAVE_TYPE } from './constants.js';
class TagCreation extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            id: props.tag.id,
            name: props.tag.name,
            description: props.tag.description
        };
        this.handleTextFieldUpdate = this.handleTextFieldUpdate.bind(this);
        this.saveTag = this.saveTag.bind(this);
        this.saveCallback = props.onSave.bind(this);
    }

    handleTextFieldUpdate(stateProperty, evt) {
        this.setState({
            [stateProperty]: evt.target.value
        })
    }



    componentWillReceiveProps(props) {

        this.setState({
            name: '',
            description: ''

        });
    }

    saveTag(evt) {
        var targetUrl = this.props.listUrl;
        const payload = { name: this.state.name, description: this.state.description };
        const currentInstance = this;
        if (this.state.id > 0) {
            // Update an exising Tag.
            targetUrl = get_url(this.props.detailUrl, { id: this.state.id });
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function (response) {
                currentInstance.saveCallback(response.data, TAG_SAVE_TYPE.UPDATE);
            }).catch(function (error) {
                console.error("Error in updating the tag.", error);
                console.error(error.response.data);
            })
        }
        else {
            // Create a new Tag.
            axios.post(targetUrl, payload, {
                responseType: 'json'
            }).then(function (response) {
                currentInstance.saveCallback(response.data, TAG_SAVE_TYPE.CREATE);
                currentInstance.setState({
                    message: 'Save successful',
                    messageType: 'info'});
            }).catch(function (error) {
                console.error("Error in creating a new Tag", error);
                console.error(error.response.data);
                let errorMsg = 'Error in creating the library version.';
                if (!(JSON.stringify(error.response.data).indexOf('DUPLICATE_LAYOUT_NAME') === -1)) {
                    errorMsg = (<React.Fragment><b>ERROR:</b> There is an existing library version with the same name. Please change the name, and try again.</React.Fragment>);
                }
                currentInstance.setState({
                    message: errorMsg,
                    messageType: 'error'
                });
            })
            

        }
    }





    render() {
        return (
            <Grid container spacing={0} style={{ paddingLeft: '20px' }}>
                <Grid item xs={8}>
                    <Button variant="raised" color="primary" onClick={e => { this.props.onCancel() }}>
                        Cancel
                    </Button>
                    <Button variant="raised" color="primary" onClick={evt => this.saveTag(evt)}>
                        Save
                    </Button>
                </Grid>
                <Grid item xs={8}>
                    <Typography gutterBottom align="center" variant="headline" component="h2">
                        {this.props.title}
                    </Typography>
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
                        value={this.state.description}
                        onChange={evt => this.handleTextFieldUpdate('description', evt)}
                        fullWidth
                        margin="normal"
                    />
                </Grid>
            </Grid>
        );



    }
}

module.exports = TagCreation;