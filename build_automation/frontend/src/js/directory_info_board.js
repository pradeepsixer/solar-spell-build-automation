import axios from 'axios';
import React from 'react';

import Button from 'material-ui/Button';
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
import { convert_tags_to_filter_criteria_string, parse_filter_criteria_string } from './utils.js';

import 'react-sortable-tree/style.css';

class DirectoryInfoBoard extends React.Component {
    constructor(props) {
        super(props);
        console.log('DirInfoBoard props ', props);
        const tagIdsTagsMap = this.buildTagIdTagsMap(props.tags);
        const filterCriteriaInfo  = this.getFilterCriteriaInfoFromString(props.boardData.filterCriteria, tagIdsTagsMap);
        this.state = {
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            filterCriteria: props.boardData.filterCriteria,
            parent: props.boardData.parent,
            tagTreeData: props.tagTreeData,
            tags: props.tags,
            tagIdsTagsMap: tagIdsTagsMap,
            allFiles: props.allFiles,
            fileIdFileMap: props.fileIdFileMap,
            selectedFiles: props.boardData.individualFiles,
            selectedOperator: filterCriteriaInfo.operator,
            selectedTags: filterCriteriaInfo.selectedItems,
            fieldErrors: {}
        };

        console.log(this.state);
        this.saveDirectory = this.saveDirectory.bind(this);
        this.deleteDirectory = this.deleteDirectory.bind(this);
        this.saveCallback = this.props.onSave.bind(this);
        this.deleteCallback = this.props.onDelete.bind(this);
        this.handleChipAddition = this.handleChipAddition.bind(this);
        this.handleChipDeletion = this.handleChipDeletion.bind(this);
        this.handleOperatorChange = this.handleOperatorChange.bind(this);
        this.fileSelectionCallback = this.fileSelectionCallback.bind(this);
        this.fileDeselectionCallback = this.fileDeselectionCallback.bind(this);
    }

    buildTagIdTagsMap(tags) {
        // Builds a map of <Tag Id> - Tag
        const tagIdTagMap = {};
        tags.forEach(eachTag => {
            tagIdTagMap[eachTag.id] = eachTag;
        })
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
        const tagIdsTagsMap = this.buildTagIdTagsMap(props.tags);
        const filterCriteriaInfo  = this.getFilterCriteriaInfoFromString(props.boardData.filterCriteria, tagIdsTagsMap);
        this.setState({
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            filterCriteria: props.boardData.filterCriteria,
            parent: props.boardData.parent,
            tagTreeData: props.tagTreeData,
            tags: props.tags,
            tagIdsTagsMap: tagIdsTagsMap,
            allFiles: props.allFiles,
            fileIdFileMap: props.fileIdFileMap,
            selectedFiles: props.boardData.individualFiles,
            selectedOperator: filterCriteriaInfo.operator,
            selectedTags: filterCriteriaInfo.selectedItems,
            fieldErrors: {}
        });
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

    deleteDirectory(evt) {
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
            selectedTags.push(addedChip.name);
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

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={9}>
                    <Button variant="raised" color="primary" onClick={this.saveDirectory}>
                        Save
                    </Button>
                    {
                        this.state.id > 0 &&
                        <Button variant="raised" onClick={this.deleteDirectory}>
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
                        Tags
                    </Typography>
                    <Typography>
                        Choose content which matches
                    </Typography>
                    <Grid container spacing={24}>
                        <Grid item xs={2}>
                            <Select
                                value={this.state.selectedOperator}
                                onChange={this.handleOperatorChange}
                                displayEmpty
                                name="tag-option"
                            >
                                <MenuItem value="AND">All of the tags</MenuItem>
                                <MenuItem value="OR">Any of the tags</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={10}>
                            <AutoCompleteWithChips suggestions={this.state.tags} searchKey={'name'}
                                selectedItem={this.state.selectedTags} onAddition={this.handleChipAddition}
                                onDeletion={this.handleChipDeletion} required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <div style={{marginTop: '20px'}}></div>
                    <FileSelectionComponent allFiles={this.state.allFiles} tagIdsTagsMap={this.state.tagIdsTagsMap}
                        selectedFiles={this.state.selectedFiles} fileIdFileMap={this.state.fileIdFileMap}
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
