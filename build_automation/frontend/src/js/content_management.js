import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import AutoCompleteWithChips from './autocomplete.js';
import {APP_URLS} from "./url";
import axios from 'axios';

const styles = theme => ({
    root: {
    flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
});


class ContentManagement extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            tags: []
        }
    }
    componentDidMount() {
        this.loadData()
    }
    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.TAG_LIST, {
            responseType: 'json'
        }).then(function (response) {
            currInstance.setState({
                tags: response.data
            })
        }).catch(function (error) {
            console.log(error);
            // TODO : Show the error message.
        });
    }
    render(){
    return (
        <div>
            <Grid container spacing={8} style={{paddingLeft: '20px'}}>
                    <Grid item xs={3} style={{paddingLeft: '20px'}}>
                        <Button variant="raised" color="primary">
                            Test
                        </Button>
                    <h3>Content Management</h3>
                    <h2>Test</h2>
                    </Grid>

                    <Grid item xs={8}>
                        <AppBar position="static" style={{ height: '50px', margin: 'auto'}}>
                            <Typography gutterBottom variant="subheading" style={{color: '#ffffff'}}>

                            </Typography>
                        </AppBar>
                        <input
                        accept="*"
                        className={'hidden'}
                        id="raised-button-file"
                        multiple
                        type="file"
                        />
                    <label htmlFor="raised-button-file">
                        <Button variant="raised" component="span">
                        Upload
                        </Button>
                    </label>

                        <div style={{marginTop: '20px'}}> </div>
                        <span>
                            <AutoCompleteWithChips suggestions={this.state.tags} searchKey={'name'} selectedItem={[]} onChange={evt => console.log(evt)}/>
                        </span>
                    </Grid>
            </Grid>

        </div>
    )
    }
}
module.exports = ContentManagement;
