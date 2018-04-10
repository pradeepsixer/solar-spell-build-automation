import axios from 'axios';
import React from 'react';

import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

import SortableTree from 'react-sortable-tree';

import AutoCompleteWithChips from './autocomplete.js';
import FileSelectionComponent from './directory_file_selection.js'
import { APP_URLS, get_url } from './url.js';
import { buildMapFromArray } from './utils.js';

import 'react-sortable-tree/style.css';

class DirectoryInfoBoard extends React.Component {
    constructor(props) {
        super(props);
        console.log('DirInfoBoard props ', props);
        this.state = {
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            parent: props.boardData.parent,
            tagTreeData: props.tagTreeData,
            selectedFiles: props.boardData.individualFiles,
            confirmDelete: false,
            fieldErrors: {}
        };

        this.allFiles = props.allFiles;
        this.fileIdFileMap = props.fileIdFileMap;
        this.tagIdsTagsMap = this.buildTagIdTagsMap(props.tags);
        this.saveDirectory = this.saveDirectory.bind(this);
        this.deleteDirectory = this.deleteDirectory.bind(this);
        this.saveCallback = this.props.onSave.bind(this);
        this.deleteCallback = this.props.onDelete.bind(this);
        this.handleChipAddition = this.handleChipAddition.bind(this);
        this.handleChipDeletion = this.handleChipDeletion.bind(this);
        this.handleOperatorChange = this.handleOperatorChange.bind(this);
        this.fileSelectionCallback = this.fileSelectionCallback.bind(this);
        this.fileDeselectionCallback = this.fileDeselectionCallback.bind(this);
        this.confirmDeleteDirectory = this.confirmDeleteDirectory.bind(this);
        this.closeConfirmDialog = this.closeConfirmDialog.bind(this);
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
        tags.forEach(eachTag => {
            tagNameTagMap[eachTag.name] = eachTag;
        })
        return tagNameTagMap;
    }

    getFilterCriteriaInfoFromString(filterCriteria, tagIdTagsMap) {
        if (!filterCriteria || filterCriteria.length == 0) {
            return {operator: 'AND' , selectedItems: []};
        }
        const filterCriteriaInfo = parse_filter_criteria_string(filterCriteria);
        const selectedItems = [];
        filterCriteriaInfo.tags.forEach(eachTagId => {
            selectedItems.push(tagIdTagsMap[eachTagId].name);
        });
        const retval = {
            operator: filterCriteriaInfo.operator,
            selectedItems: selectedItems
        }
        console.log(retval);
        return retval;
    }

    componentWillReceiveProps(props) {
        console.log('DirInfoBoard props ', props);
        this.setState({
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            parent: props.boardData.parent,
            tagTreeData: props.tagTreeData,
            selectedFiles: props.boardData.individualFiles,
            confirmDelete: false,
            fieldErrors: {}
        });
        this.allFiles = props.allFiles;
        this.tagIdsTagsMap = this.buildTagIdTagsMap(props.tags);
        this.fileIdFileMap = props.fileIdFileMap;
    }

    saveDirectory(evt) {
        if (!this.is_valid_state()) {
            // If it is in an invalid state, do not proceed with the save operation.
            return;
        }
        var targetUrl = APP_URLS.DIRECTORY_LIST;
        const tagNameTagMap = this.buildTagNameTagMap(this.state.tags);
        const allSelectedTags = [];
        this.state.selectedTags.forEach(eachTagName => {
            allSelectedTags.push(tagNameTagMap[eachTagName]);
        });
        const filterCriteriaString = convert_tags_to_filter_criteria_string(allSelectedTags, this.state.selectedOperator);
        console.log(filterCriteriaString);
        const payload = {
            name: this.state.name,
            dir_layout: this.state.dirLayoutId,
            filter_criteria: filterCriteriaString,
            individual_files: this.state.selectedFiles,
            parent: this.state.parent
        };

        const currInstance = this;
        if (this.state.id > 0) {
            // Update an existing directory.
            payload.id = this.state.id;
            targetUrl = get_url(APP_URLS.DIRECTORY_DETAIL, {id:this.state.id});
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currInstance.saveCallback(response.data);
            }).catch(function(error) {
                console.error("Error in updating the directory", error);
                console.error(error.response.data);
            });
        } else {
            // Create a new directory.
            axios.post(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currInstance.saveCallback(response.data, true);
            }).catch(function(error) {
                console.error("Error in creating a new directory", error);
                console.error(error.response.data);
            });
        }
    }

    is_valid_state() {
        var hasErrors = false;
        const fieldErrors = {};
        if (!this.state.name || this.state.name.trim().length === 0) {
            hasErrors = true;
            fieldErrors['name'] = 'Name is required.';
        }
        if (!this.state.selectedTags || this.state.selectedTags.length === 0) {
            hasErrors = true;
            fieldErrors['selectedTags'] = 'Tags are required for filtering the contents.';
        }
        if (hasErrors) {
            this.setState({fieldErrors});
        }
        return !hasErrors;
    }

    confirmDeleteDirectory() {
        this.setState({
            confirmDelete: true
        })
    }

    deleteDirectory() {
        const targetUrl = get_url(APP_URLS.DIRECTORY_DETAIL, {id:this.state.id});
        const currentInstance = this;
        axios.delete(targetUrl, {
            responseType: 'json'
        }).then(function(response) {
            currentInstance.deleteCallback(currentInstance.state.dirLayoutId, currentInstance.state.id);
        }).catch(function(error) {
            console.error("Error in deleting the directory", error);
        });
    }

    handleTextFieldUpdate(stateProperty, evt) {
        const targetVal = evt.target.value;
        const newState = {
            [stateProperty]: targetVal
        };
        this.setState((prevState, props) => {
            newState.fieldErrors = prevState.fieldErrors;
            newState.fieldErrors[stateProperty] = null;
            return newState;
        })
    }

    handleOperatorChange(evt) {
        console.log(evt.target.value);
        this.setState({
            selectedOperator: evt.target.value
        })
    }

    /* Called when a chip is added to the autocomplete component. */
    handleChipAddition(addedChip) {
        this.setState((prevState, props) => {
            const selectedTags = prevState.selectedTags;
            if (selectedTags.indexOf(addedChip.name) === -1) {
                selectedTags.push(addedChip.name);
            }
            return {selectedTags};
        });
    }

    handleChipDeletion(deletedChip) {
        this.setState((prevState, props) => {
            const selectedTags = prevState.selectedTags;
            selectedTags.splice(selectedTags.indexOf(deletedChip.name), 1);
            return {selectedTags};
        });
    }

    fileSelectionCallback(file) {
        this.setState((prevState, props) => {
            const {selectedFiles} = prevState;
            if (selectedFiles.indexOf(file.id) === -1) {
                selectedFiles.push(file.id);
            }
            return {selectedFiles};
        });
    }

    fileDeselectionCallback(file) {
        this.setState((prevState, props) => {
            const {selectedFiles} = prevState;
            selectedFiles.splice(selectedFiles.indexOf(file.id), 1);
            return {selectedFiles};
        });
    }

    closeConfirmDialog() {
        this.setState({confirmDelete: false})
    }

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={9}>
                    <Button variant="raised" color="primary" onClick={this.saveDirectory}>
                        Save
                    </Button>
                    {
                        this.state.id > 0 &&
                        <Button variant="raised" onClick={this.confirmDeleteDirectory}>
                        Delete
                        </Button>
                    }
                    <TextField
                      id="name"
                      label="Name"
                      required
                      error={this.state.fieldErrors.name ? true: false}
                      value={this.state.name}
                      onChange={evt => this.handleTextFieldUpdate('name', evt)}
                      fullWidth
                      margin="normal"
                    />
                    <p></p>
                    <Typography gutterBottom variant="headline" component="h2">
                        Filter by Metadata
                    </Typography>
                    <Typography>
                        Filter contents to go into the folder / sub-folder by the metadata.
                    </Typography>
                    <Grid container spacing={24} style={{marginTop: '15px'}}>
                        <Grid item xs={3}>
                            <Select
                                value={'AND'}
                                displayEmpty
                                name="creators-operator"
                            >
                                <MenuItem value="AND">All of the Creators</MenuItem>
                                <MenuItem value="OR">Any of the Creators</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['creators']} searchKey={'name'}
                                selectedItem={[]} onAddition={null} onDeletion={null} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                value={'AND'}
                                displayEmpty
                                name="coverage-operator"
                            >
                                <MenuItem value="AND">All of the Coverages</MenuItem>
                                <MenuItem value="OR">Any of the Coverages</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['coverages']} searchKey={'name'}
                                selectedItem={[]} onAddition={null} onDeletion={null} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                value={'AND'}
                                displayEmpty
                                name="subjects-operator"
                            >
                                <MenuItem value="AND">All of the Subjects</MenuItem>
                                <MenuItem value="OR">Any of the Subjects</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['subjects']} searchKey={'name'}
                                selectedItem={[]} onAddition={null} onDeletion={null} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                value={'AND'}
                                displayEmpty
                                name="keywords-operator"
                            >
                                <MenuItem value="AND">All of the Keywords</MenuItem>
                                <MenuItem value="OR">Any of the Keywords</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['keywords']} searchKey={'name'}
                                selectedItem={[]} onAddition={null} onDeletion={null} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                value={'AND'}
                                displayEmpty
                                name="workarea-operator"
                            >
                                <MenuItem value="AND">All of the Work Areas</MenuItem>
                                <MenuItem value="OR">Any of the Work Areas</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['workareas']} searchKey={'name'}
                                selectedItem={[]} onAddition={null} onDeletion={null} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                value={'AND'}
                                displayEmpty
                                name="lang-operator"
                            >
                                <MenuItem value="AND">All of the Languages</MenuItem>
                                <MenuItem value="OR">Any of the Languages</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['languages']} searchKey={'name'}
                                selectedItem={[]} onAddition={null} onDeletion={null} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                value={'AND'}
                                displayEmpty
                                name="cataloger-operator"
                            >
                                <MenuItem value="AND">All of the Catalogers</MenuItem>
                                <MenuItem value="OR">Any of the Catalogers</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['catalogers']} searchKey={'name'}
                                selectedItem={[]} onAddition={null} onDeletion={null} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    {
                        /*
                    <Typography gutterBottom variant="subheading" style={{marginTop: '10px'}}>
                        Work Areas
                    </Typography>
                    <Typography>
                        Choose content matching the following Work Areas:
                    </Typography>
                        */
                    }

                    <div style={{marginTop: '40px'}}></div>
                    <FileSelectionComponent allFiles={this.allFiles} tagIdsTagsMap={this.tagIdsTagsMap}
                        selectedFiles={this.state.selectedFiles} fileIdFileMap={this.fileIdFileMap}
                        onFileSelect={this.fileSelectionCallback} onFileDeselect={this.fileDeselectionCallback}
                    />
                </Grid>
                <Grid item xs={3}>
                    {
                        this.state.tagTreeData.length > 0 ?
                            (<SortableTree
                                treeData={this.state.tagTreeData}
                                onChange={newTreeData => {
                                    this.setState({tagTreeData: newTreeData});
                                }}
                                canDrag={false}
                                generateNodeProps={nodeInfo => ({
                                    onClick: (evt) => this.handleTagClick(nodeInfo, evt),
                                })}
                            />) : 'No Tags Available'
                    }
                </Grid>
                <Dialog
                    open={this.state.confirmDelete}
                    onClose={this.closeConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete the directory {this.state.name}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeConfirmDialog} color="primary">
                            No
                        </Button>
                        <Button onClick={evt => {this.closeConfirmDialog(); this.deleteDirectory();}} color="primary" autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        );
    }

    handleTagClick(nodeInfo, evt) {
        const evtTarget = evt.target;
        if (!(evtTarget.className.includes('expandButton') || evtTarget.className.includes('collapseButton'))) {
            this.setState((prevState, props) => {
                const selectedTags = prevState.selectedTags;
                if (selectedTags.indexOf(nodeInfo.node.name) === -1) {
                    selectedTags.push(nodeInfo.node.name);
                }
                return {selectedTags};
            })
        }
    }
}

module.exports = DirectoryInfoBoard;
