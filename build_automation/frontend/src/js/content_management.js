import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import UploadContent from './upload_content';
import FileListComponent from './file_list_component';
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
            name: "",
            description: "",
            fieldErrors: {},
            updatedTime: '',
            files: [],
            currentView: 'manage'
        };
        this.setCurrentView=this.setCurrentView.bind(this);
        this.tagIdTagsMap= {};
    }
    componentDidMount() {
        // this.loadData()
    }
    buildTagIdTagsMap(tags) {
        // Builds a map of <Tag Id> - Tag
        const tagIdTagMap = {};
        tags.forEach(eachTag => {
            tagIdTagMap[eachTag.id] = eachTag;
        });
        return tagIdTagMap;
    }
    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.TAG_LIST, {
            responseType: 'json'
        }).then(function (response) {
            currInstance.tagIdTagsMap=currInstance.buildTagIdTagsMap(response.data);
            console.log(currInstance.tagIdTagsMap);
            currInstance.setState({
                tags: response.data
            })
        }).catch(function (error) {
            console.log(error);
            // TODO : Show the error message.
        });
        axios.get(APP_URLS.CONTENTS_LIST, {
            responseType: 'json'
        }).then(function (response) {
            currInstance.setState({
                files: response.data
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
    setCurrentView(viewName){
        this.setState({currentView: viewName})
    }
    render(){
        console.log(this.tagIdTagsMap);
        return (
            <div>
                <Grid container spacing={8} style={{paddingLeft: '20px'}}>
                    <Grid item xs={3} style={{paddingLeft: '20px'}}>
                        <h3>Content Management</h3>
                        <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('manage')}}>
                            Manage Content
                        </Button>
                        <div style={{marginTop: '20px'}}> </div>
                        <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('upload')}}>
                            Add Content
                        </Button>
                    </Grid>

                    <Grid item xs={8}>
                        {this.state.currentView=='manage2'&&<FileListComponent allFiles={this.state.files} />}
                        {this.state.currentView=='upload'&&<UploadContent />}
                    </Grid>
                </Grid>

            </div>
        )
    }
}
module.exports = ContentManagement;
