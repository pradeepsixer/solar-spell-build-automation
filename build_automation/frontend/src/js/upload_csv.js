import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import AutoCompleteWithChips from './autocomplete.js';
import TextField from 'material-ui/TextField';
import { DatePicker } from 'material-ui-pickers';
import {APP_URLS, get_url} from "./url";
import Snackbar from 'material-ui/Snackbar';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import {ChevronLeft, ChevronRight} from 'material-ui-icons';
import axios from 'axios';
import {buildMapFromArray} from "./utils";

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


class UploadCSV extends React.Component{
    constructor(props) {
        super(props);
        this.tagIdsTagsMap = this.buildTagIdTagsMap(props.allTags);
        const labels = this.getAutoCompleteLabelsFromTagIds(props.content, this.tagIdsTagsMap);
        this.state = {
            id: props.content.id,
            name: props.content.name,
            description: props.content.description,
            creators: labels.creators,
            coverages: labels.coverages,
            subjects: labels.subjects,
            keywords: labels.keywords,
            workareas: labels.workareas,
            languages: labels.languages,
            catalogers: labels.catalogers,
            fieldErrors: {},
            selectedDate: props.content.updatedDate,
            source: props.content.source,
            copyright: props.content.copyright,
            rightsStatement: props.content.rightsStatement,
            contentFile: null,
            contentFileName: props.content.originalFileName ? props.content.originalFileName : '',
        };
        this.tags = props.allTags;
        this.tagNameTagMap = this.buildTagNameTagMap(props.allTags);
        this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this);
        this.handleDateChange=this.handleDateChange.bind(this);
        this.handleTagAddition=this.handleTagAddition.bind(this);
        this.handleCreatorAddition=this.handleCreatorAddition.bind(this);
        this.handleCoverageAddition=this.handleCoverageAddition.bind(this);
        this.handleSubjectAddition=this.handleSubjectAddition.bind(this);
        this.handleKeywordAddition=this.handleKeywordAddition.bind(this);
        this.handleWorkareaAddition=this.handleWorkareaAddition.bind(this);
        this.handleLanguageAddition=this.handleLanguageAddition.bind(this);
        this.handleCatalogerAddition=this.handleCatalogerAddition.bind(this);
        this.handleTagDeletion=this.handleTagDeletion.bind(this);
        this.handleCreatorDeletion=this.handleCreatorDeletion.bind(this);
        this.handleCoverageDeletion=this.handleCoverageDeletion.bind(this);
        this.handleSubjectDeletion=this.handleSubjectDeletion.bind(this);
        this.handleKeywordDeletion=this.handleKeywordDeletion.bind(this);
        this.handleWorkareaDeletion=this.handleWorkareaDeletion.bind(this);
        this.handleLanguageDeletion=this.handleLanguageDeletion.bind(this);
        this.handleCatalogerDeletion=this.handleCatalogerDeletion.bind(this);
        this.handleFileSelection=this.handleFileSelection.bind(this);
        this.saveContent=this.saveContent.bind(this);
        this.saveTag=this.saveTag.bind(this);
        this.saveCallback=props.onSave.bind(this);
    }
    buildTagIdTagsMap(tags) {
        // Builds a map of <Tag Id> - Tag map for each tag type.
        const tagIdTagMap = {};
        Object.keys(tags).forEach(eachTagType => {
            tagIdTagMap[eachTagType] = buildMapFromArray(tags[eachTagType], 'id');
        });
        return tagIdTagMap;
    }
    buildTagNameTagMap(tags) {
        const tagNameTagMap = {};
        Object.keys(tags).forEach(eachTagType => {
            tagNameTagMap[eachTagType] = buildMapFromArray(tags[eachTagType], 'name');
        });
        return tagNameTagMap;
    }
    getAutoCompleteLabelsFromTagIds(boardInfo, tagIdsTagsMap) {
        const retval = {};
        Object.keys(tagIdsTagsMap).forEach(eachTagType => {
            const selectedTagsForDir = boardInfo[eachTagType];
            const selectedTypeAllTags = tagIdsTagsMap[eachTagType];
            const labels = [];
            selectedTagsForDir.forEach(eachTagId => {
                labels.push(selectedTypeAllTags[eachTagId].name);
            });
            retval[eachTagType] = labels;
        });
        return retval;
    }
    componentDidMount() {
        // this.loadData()
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
            console.error(error);
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
    handleTagAddition(tag, tagType){
        this.setState((prevState, props) => {
            const selectedTags = prevState[tagType];
            const fieldErrors = prevState.fieldErrors;
            selectedTags.push(tag.name);
            fieldErrors[tagType] = null;
            const value = {[tagType]: selectedTags, fieldErrors};
            return value;
        })
    }
    handleTagDeletion(tag, tagType){
        this.setState((prevState, props) => {
            const selectedTags = prevState[tagType];
            selectedTags.splice(selectedTags.indexOf(tag.name), 1);
            const value = {[tagType]: selectedTags};
            return value;
        })
    }
    handleCreatorAddition(creator){
        this.handleTagAddition(creator, 'creators')
    }
    handleCoverageAddition(coverage){
        this.handleTagAddition(coverage, 'coverages')
    }
    handleSubjectAddition(subject){
        this.handleTagAddition(subject, 'subjects')
    }
    handleKeywordAddition(keyword){
        this.handleTagAddition(keyword, 'keywords')
    }
    handleWorkareaAddition(workarea){
        this.handleTagAddition(workarea, 'workareas')
    }
    handleLanguageAddition(language){
        this.handleTagAddition(language, 'languages')
    }
    handleCatalogerAddition(cataloger){
        this.handleTagAddition(cataloger, 'catalogers')
    }
    handleCreatorDeletion(creator){
        this.handleTagDeletion(creator, 'creators')
    }
    handleCoverageDeletion(coverage){
        this.handleTagDeletion(coverage, 'coverages')
    }
    handleSubjectDeletion(subject){
        this.handleTagDeletion(subject, 'subjects')
    }
    handleKeywordDeletion(keyword){
        this.handleTagDeletion(keyword, 'keywords')
    }
    handleWorkareaDeletion(workarea){
        this.handleTagDeletion(workarea, 'workareas')
    }
    handleLanguageDeletion(language){
        this.handleTagDeletion(language, 'languages')
    }
    handleCatalogerDeletion(cataloger){
        this.handleTagDeletion(cataloger, 'catalogers')
    }
    is_valid_state(is_save) {
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
    getSelectedTags() {
        const tagTypeSelectedTagsMap = {};
        Object.keys(this.props.allTags).forEach(eachTagType => {
            tagTypeSelectedTagsMap[eachTagType] = this.getSelectedTagsIdsFromName(eachTagType);
        });
        return tagTypeSelectedTagsMap;
    }
    getSelectedTagsIdsFromName(tagType) {
        const matchingTagIds = [];
        this.state[tagType].forEach(eachLabel => {
            matchingTagIds.push(this.tagNameTagMap[tagType][eachLabel].id);
        });
        return matchingTagIds;
    }
    formatDate(input) {
        const year = input.getFullYear();
        let month = input.getMonth()+1;
        if (month < 10) {
            month = '0' + month;
        }
        let date = input.getDate();
        if (date < 10) {
            date = '0' + date;
        }
        return year + '-' + month + '-' + date;
    }
    saveContent(evt) {

        console.log("Inside the save content function");
        // if (!this.is_valid_state(!(this.state.id > 0))) {
        //   console.log("It is an invalid state");
        //   console.log(this.state);
        //     // If it is in an invalid state, do not proceed with the save operation.
        //     return;
        // }

        console.log("It is a valid state");
        console.log(this.state);

        var ourfile = this.state.contentFile;
        console.log("File is of type : ");
        console.log(ourfile);


        var targetUrl = APP_URLS.CONTENTS_LIST;
        console.log("Target URL: ");
        console.log(APP_URLS);

        const selectedTags = this.getSelectedTags();
        const payload = new FormData();
        payload.append('name', this.state.name);
        payload.append('description', this.state.description);
        selectedTags.creators.forEach(creator => {payload.append('creators', creator)});
        selectedTags.coverages.length>0 && payload.append('coverage', selectedTags.coverages[0]);
        selectedTags.subjects.forEach(subject => {payload.append('subjects', subject)});
        selectedTags.keywords.forEach(keyword => {payload.append('keywords', keyword)});
        selectedTags.workareas.forEach(workarea => {payload.append('workareas', workarea)});
        selectedTags.languages.length>0 && payload.append('language', selectedTags.languages[0]);
        selectedTags.catalogers.length>0 && payload.append('cataloger', selectedTags.catalogers[0]);
        payload.append('updated_time', this.formatDate(this.state.selectedDate));
        Boolean(this.state.contentFile) && payload.append('content_file', this.state.contentFile);
        Boolean(this.state.source) && payload.append('source', this.state.source);
        Boolean(this.state.copyright) && payload.append('copyright', this.state.copyright);
        Boolean(this.state.rightsStatement) && payload.append('rights_statement', this.state.rightsStatement);
        const currInstance = this;
        if (this.state.id > 0) {
            // Update an existing directory.
            payload.append('id', this.state.id);
            targetUrl = get_url(APP_URLS.CONTENT_DETAIL, {id:this.state.id});
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currInstance.saveCallback(response.data, true);
            }).catch(function(error) {
                console.error("Error in updating the content", error);
                console.error(error.response.data);
                let errorMsg = 'Error in updating the content';
                currInstance.setState({
                    message: errorMsg,
                    messageType: 'error'
                });
            });
        } else {
            // Create a new directory.
            axios.post(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currInstance.saveCallback(response.data, false);
            }).catch(function(error) {
                console.error("Error in uploading the content", error);
                console.error(error.response.data);
                let errorMsg = 'Error in uploading the content';
                currInstance.setState({
                    message: errorMsg,
                    messageType: 'error'
                });
            });
        }
    }

    handleFileSelection(evt) {
        evt.persist();
        const file = evt.target.files[0];
        if (!Boolean(file)) { // If there is no file selected.
            return;
        }
        this.setState((prevState, props) => {
            const newState = {
                contentFile: file,
                contentFileName: file.name,
                fieldErrors: prevState.fieldErrors,
            };
            newState.fieldErrors['file'] = null;
            return newState;
        });
    }

    saveTag(tagName, url, tagType){
        const payload = {name: tagName, description: tagName};
        const currentInstance = this;
        axios.post(url, payload, {responseType: 'json'}).then(function(response) {
            currentInstance.tags[tagType].push(response.data);
            currentInstance.tagIdsTagsMap[tagType][response.data.id] = response.data;
            currentInstance.tagNameTagMap[tagType][response.data.name] = response.data;
            currentInstance.setState((prevState, props) => {
                const newState = {
                    [tagType]: prevState[tagType],
                    message: 'Metadata created',
                    messageType: 'info',
                };
                newState[tagType].push(tagName);
                return newState;
            })
        }).catch(function(error) {
            console.error("Error in creating a new directory", error);
            console.error(error.response.data);
            let errorMsg = 'Error in creating the folder';
            if (!(JSON.stringify(error.response.data).indexOf('DUPLICATE_DIRECTORY') === -1)) {
                errorMsg = (<React.Fragment><b>ERROR:</b> There is another folder under the same name within the current folder. Please change the name, and try again.</React.Fragment>);
            }
            currInstance.setState({
                message: errorMsg,
                messageType: 'error'
            });
        });
    }

    render(){
        return (
            <Grid item xs={8}>
                <AppBar position="static" style={{ height: '50px', margin: 'auto'}}>
                    <Typography gutterBottom variant="subheading" style={{color: '#ffffff'}}>

                    </Typography>
                </AppBar>
                <div style={{marginTop: '20px'}}> </div>
                <TextField
                    id="csvFile"
                    label="CSV File"
                    multiline
                    disabled
                    InputLabelProps={{
                        shrink: true,
                    }}
                    error={this.state.fieldErrors.file ? true : false}
                    value={this.state.contentFileName}
                    margin="normal"
                />
                <input
                    accept="*"
                    className={'hidden'}
                    id="raised-button-file"
                    multiple
                    type="file"
                    ref={input => {this.fileInput = input;}}
                    onChange={this.handleFileSelection}
                />
                <label htmlFor="raised-button-file">
                    <Button variant="raised" component="span">
                        Browse
                    </Button>
                </label>

                <div style={{marginTop: '20px'}}> </div>

                <Button variant="raised" component="span" onClick={this.saveContent}>
                    Save Contents
                </Button>

                <div style={{marginTop: '20px'}}> </div>
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
            </Grid>
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
module.exports = UploadCSV;
