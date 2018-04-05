import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import AutoCompleteWithChips from './autocomplete.js';
import TextField from 'material-ui/TextField';
import { DateTimePicker } from 'material-ui-pickers';
import {APP_URLS} from "./url";
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
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


class UploadContent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            name: "",
            description: "",
            fieldErrors: {},
            updatedTime: '',
            selectedDate: new Date()
        }
        this.handleDateChange=this.handleDateChange.bind(this);
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
    handleDateChange(date){
        this.setState({ selectedDate: date });
    };

    render(){
        return (
            <Grid item xs={8}>
                <AppBar position="static" style={{ height: '50px', margin: 'auto'}}>
                    <Typography gutterBottom variant="subheading" style={{color: '#ffffff'}}>

                    </Typography>
                </AppBar>
                <div style={{marginTop: '20px'}}> </div>

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
                <div style={{marginTop: '20px'}}> </div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker
                        id="updated_time"
                        label="Last Updated:"
                        value={this.state.selectedDate}
                        onChange={this.handleDateChange}
                    />
                </MuiPickersUtilsProvider>
                <div style={{marginTop: '20px'}}> </div>
                <Typography gutterBottom variant="subheading">
                    Tags
                </Typography>
                <span>
                            <AutoCompleteWithChips suggestions={this.state.tags} searchKey={'name'} selectedItem={[]} onChange={evt => console.log(evt)}/>
                        </span>
                <div style={{marginTop: '20px'}}> </div>
                <input
                    accept="*"
                    className={'hidden'}
                    id="raised-button-file"
                    multiple
                    type="file"
                    ref={input => {this.fileInput = input;}}
                    onChange={e => console.log(this.fileInput.files)}
                />
                <label htmlFor="raised-button-file">
                    <Button variant="raised" component="span">
                        Browse
                    </Button>
                </label>
                <Button variant="raised" component="span">
                    Save
                </Button>

                <div style={{marginTop: '20px'}}> </div>

            </Grid>
        )
    }
}
module.exports = UploadContent;
