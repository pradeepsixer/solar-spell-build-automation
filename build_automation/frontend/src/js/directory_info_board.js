import axios from 'axios';
import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import OpenInNew from '@material-ui/icons/OpenInNew';

import SortableTree from 'react-sortable-tree';

import AutoCompleteWithChips from './autocomplete.js';
import { HTTP_STATUS } from './constants.js';
import FileSelectionComponent from './directory_file_selection.js'
import { APP_URLS, get_url } from './url.js';
import { buildMapFromArray } from './utils.js';

import 'react-sortable-tree/style.css';

class DirectoryInfoBoard extends React.Component {
    constructor(props) {
        super(props);
        this.tagIdsTagsMap = this.buildTagIdTagsMap(props.tags);
        const labels = this.getAutoCompleteLabelsFromTagIds(props.boardData, this.tagIdsTagsMap);
        this.state = {
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            parent: props.boardData.parent,
            bannerFile: null,
            bannerFileName: props.boardData.originalFileName ? props.boardData.originalFileName : '',
            creators: labels['creators'],
            coverages: labels['coverages'],
            subjects: labels['subjects'],
            keywords: labels['keywords'],
            workareas: labels['workareas'],
            languages: labels['languages'],
            catalogers: labels['catalogers'],
            creatorsNeedAll: (props.boardData.creatorsNeedAll ? 'All' : 'Any'),
            coveragesNeedAll: (props.boardData.coveragesNeedAll ? 'All' : 'Any'),
            subjectsNeedAll: (props.boardData.subjectsNeedAll ? 'All' : 'Any'),
            keywordsNeedAll: (props.boardData.keywordsNeedAll ? 'All' : 'Any'),
            workareasNeedAll: (props.boardData.workareasNeedAll ? 'All' : 'Any'),
            languagesNeedAll: (props.boardData.languagesNeedAll ? 'All' : 'Any'),
            catalogersNeedAll: (props.boardData.catalogersNeedAll ? 'All' : 'Any'),
            selectedFiles: props.boardData.individualFiles,
            confirmDelete: false,
            labels: labels,
            fieldErrors: {},
            message: null,
            messageType: 'info'
        };

        this.allFiles = props.allFiles;
        this.tagNameTagMap = this.buildTagNameTagMap(props.tags);
        this.fileIdFileMap = props.fileIdFileMap;
        this.saveDirectory = this.saveDirectory.bind(this);
        this.deleteDirectory = this.deleteDirectory.bind(this);
        this.saveCallback = this.props.onSave.bind(this);
        this.deleteCallback = this.props.onDelete.bind(this);
        this.handleBannerSelection = this.handleBannerSelection.bind(this);
        this.handleChipAddition = this.handleChipAddition.bind(this);
        this.handleChipDeletion = this.handleChipDeletion.bind(this);
        this.handleOperatorChange = this.handleOperatorChange.bind(this);
        this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this);
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
        return retval;
    }

    componentWillReceiveProps(props) {
        this.tagIdsTagsMap = this.buildTagIdTagsMap(props.tags);
        const labels = this.getAutoCompleteLabelsFromTagIds(props.boardData, this.tagIdsTagsMap);
        this.setState({
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            parent: props.boardData.parent,
            bannerFile: null,
            bannerFileName: props.boardData.originalFileName ? props.boardData.originalFileName : '',
            creators: labels['creators'],
            coverages: labels['coverages'],
            subjects: labels['subjects'],
            keywords: labels['keywords'],
            workareas: labels['workareas'],
            languages: labels['languages'],
            catalogers: labels['catalogers'],
            creatorsNeedAll: (props.boardData.creatorsNeedAll ? 'All' : 'Any'),
            coveragesNeedAll: (props.boardData.coveragesNeedAll ? 'All' : 'Any'),
            subjectsNeedAll: (props.boardData.subjectsNeedAll ? 'All' : 'Any'),
            keywordsNeedAll: (props.boardData.keywordsNeedAll ? 'All' : 'Any'),
            workareasNeedAll: (props.boardData.workareasNeedAll ? 'All' : 'Any'),
            languagesNeedAll: (props.boardData.languagesNeedAll ? 'All' : 'Any'),
            catalogersNeedAll: (props.boardData.catalogersNeedAll ? 'All' : 'Any'),
            selectedFiles: props.boardData.individualFiles,
            confirmDelete: false,
            fieldErrors: {}
        });
        this.allFiles = props.allFiles;
        this.tagNameTagMap = this.buildTagNameTagMap(props.tags);
        this.fileIdFileMap = props.fileIdFileMap;
    }

    getSelectedTagsIdsFromName(tagType) {
        const matchingTagIds = [];
        this.state[tagType].forEach(eachLabel => {
            matchingTagIds.push(this.tagNameTagMap[tagType][eachLabel].id);
        });
        return matchingTagIds;
    }

    getSelectedTags() {
        const tagTypeSelectedTagsMap = {};
        Object.keys(this.props.tags).forEach(eachTagType => {
            tagTypeSelectedTagsMap[eachTagType] = this.getSelectedTagsIdsFromName(eachTagType);
        });
        return tagTypeSelectedTagsMap;
    }

    saveDirectory(evt) {
        if (!this.is_valid_state(!(this.state.id > 0))) {
            // If it is in an invalid state, do not proceed with the save operation.
            return;
        }
        var targetUrl = APP_URLS.DIRECTORY_LIST;
        const selectedTags = this.getSelectedTags();
        const payload = new FormData();
        payload.append('name', this.state.name);
        payload.append('dir_layout', this.state.dirLayoutId);
        this.state.selectedFiles.forEach(file => {payload.append('individual_files', file)});
        selectedTags['creators'].forEach(creator => {payload.append('creators', creator)});
        selectedTags['coverages'].forEach(coverage => {payload.append('coverages', coverage)});
        selectedTags['subjects'].forEach(subject => {payload.append('subjects', subject)});
        selectedTags['keywords'].forEach(keyword => {payload.append('keywords', keyword)});
        selectedTags['workareas'].forEach(workarea => {payload.append('workareas', workarea)});
        selectedTags['languages'].forEach(language => {payload.append('languages', language)});
        selectedTags['catalogers'].forEach(cataloger => {payload.append('catalogers', cataloger)});
        payload.append('creators_need_all', (this.state.creatorsNeedAll === 'All'));
        payload.append('coverages_need_all', (this.state.coveragesNeedAll === 'All'));
        payload.append('subjects_need_all', (this.state.subjectsNeedAll === 'All'));
        payload.append('keywords_need_all', (this.state.keywordsNeedAll === 'All'));
        payload.append('workareas_need_all', (this.state.workareasNeedAll === 'All'));
        payload.append('languages_need_all', (this.state.languagesNeedAll === 'All'));
        payload.append('catalogers_need_all', (this.state.catalogersNeedAll === 'All'));
        Boolean(this.state.parent) && payload.append('parent', this.state.parent);
        Boolean(this.state.bannerFile) && payload.append('banner_file', this.state.bannerFile);
        const currInstance = this;
        if (this.state.id > 0) {
            // Update an existing directory.
            payload.append('id', this.state.id);
            targetUrl = get_url(APP_URLS.DIRECTORY_DETAIL, {id:this.state.id});
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currInstance.saveCallback(response.data);
                currInstance.setState({
                    message: 'Save successful',
                    messageType: 'info'
                });
            }).catch(function(error) {
                console.error("Error in updating the directory", error);
                console.error(error.response.data);
                let errorMsg = 'Error in updating the folder';
                if (!(JSON.stringify(error.response.data).indexOf('DUPLICATE_DIRECTORY') === -1)) {
                    errorMsg = (<React.Fragment><b>ERROR:</b> There is another folder under the same name within the current folder. Please change the name, and try again.</React.Fragment>);
                }
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
                currInstance.saveCallback(response.data, true);
                currInstance.setState({
                    message: 'Save successful',
                    messageType: 'info'
                });
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
    }

    is_valid_state(is_save) {
        var hasErrors = false;
        const fieldErrors = {};
        if (!this.state.name || this.state.name.trim().length === 0) {
            hasErrors = true;
            fieldErrors['name'] = 'Name is required.';
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
            currentInstance.setState({
                message: 'Error in deleting the folder. Please reload the page, and try again.',
                messageType: 'error'
            });
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

    handleOperatorChange(evt, targetElem) {
        this.setState({
            [targetElem]: evt.target.value
        })
    }

    /* Called when a chip is added to the autocomplete component. */
    handleChipAddition(addedChip, tagType) {
        this.setState((prevState, props) => {
            const selectedTags = prevState[tagType];
            selectedTags.push(addedChip.name);
            return {[tagType]: selectedTags};
        });
    }

    handleChipDeletion(deletedChip, tagType) {
        this.setState((prevState, props) => {
            const selectedTags = prevState[tagType];
            selectedTags.splice(selectedTags.indexOf(deletedChip.name), 1);
            return {[tagType]: selectedTags};
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

    handleBannerSelection(evt) {
        evt.persist();
        const file = evt.target.files[0];
        if (!Boolean(file)) { // If there is no file selected.
            return;
        }
        this.setState((prevState, props) => {
            const newState = {
                bannerFile: file,
                bannerFileName: file.name,
                fieldErrors: prevState.fieldErrors,
            };
            newState.fieldErrors['banner'] = null;
            return newState;
        });
    }

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={this.saveDirectory}>
                        Save
                    </Button>
                    {
                        this.state.id > 0 &&
                        <Button variant="contained" color="secondary" onClick={this.confirmDeleteDirectory}>
                        Delete
                        </Button>
                    }
                    <TextField
                      id="name"
                      label="Name *"
                      error={this.state.fieldErrors.name ? true: false}
                      value={this.state.name}
                      onChange={evt => this.handleTextFieldUpdate('name', evt)}
                      fullWidth
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
                        <Button variant="contained" component="span">
                            Browse
                        </Button>
                    </label>
                    {
                        this.props.boardData.bannerFile &&
                            <OpenInNew onClick={evt => window.open(this.props.boardData.bannerFile, "_blank")}
                                className="handPointer" title="Open in new window"/>
                    }
                    <p></p>
                    <Typography gutterBottom variant="h5" component="h2">
                        Filter by Metadata
                    </Typography>
                    <Typography>
                        Filter contents to go into the folder / sub-folder by the metadata.
                    </Typography>
                    <Grid container spacing={24} style={{marginTop: '15px'}}>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                value={this.state.creatorsNeedAll}
                                displayEmpty
                                name="creators-operator"
                                onChange={evt => this.handleOperatorChange(evt, 'creatorsNeedAll')}
                            >
                                <MenuItem value="All">All of the Creators</MenuItem>
                                <MenuItem value="Any">Any of the Creators</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['creators']}
                                selectedItem={this.state.creators}
                                onAddition={addedTag => {this.handleChipAddition(addedTag, 'creators')}}
                                onDeletion={deletedTag => {this.handleChipDeletion(deletedTag, 'creators')}}
                                required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                value={this.state.coveragesNeedAll}
                                displayEmpty
                                name="coverage-operator"
                                onChange={evt => this.handleOperatorChange(evt, 'coveragesNeedAll')}
                            >
                                <MenuItem value="All">All of the Coverages</MenuItem>
                                <MenuItem value="Any">Any of the Coverages</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['coverages']}
                                selectedItem={this.state.coverages}
                                onAddition={addedTag => {this.handleChipAddition(addedTag, 'coverages')}}
                                onDeletion={deletedTag => {this.handleChipDeletion(deletedTag, 'coverages')}}
                                required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                value={this.state.subjectsNeedAll}
                                displayEmpty
                                name="subjects-operator"
                                onChange={evt => this.handleOperatorChange(evt, 'subjectsNeedAll')}
                            >
                                <MenuItem value="All">All of the Subjects</MenuItem>
                                <MenuItem value="Any">Any of the Subjects</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['subjects']}
                                selectedItem={this.state.subjects}
                                onAddition={addedTag => {this.handleChipAddition(addedTag, 'subjects')}}
                                onDeletion={deletedTag => {this.handleChipDeletion(deletedTag, 'subjects')}}
                                required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                value={this.state.keywordsNeedAll}
                                displayEmpty
                                name="keywords-operator"
                                onChange={evt => this.handleOperatorChange(evt, 'keywordsNeedAll')}
                            >
                                <MenuItem value="All">All of the Keywords</MenuItem>
                                <MenuItem value="Any">Any of the Keywords</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['keywords']}
                                selectedItem={this.state.keywords}
                                onAddition={addedTag => {this.handleChipAddition(addedTag, 'keywords')}}
                                onDeletion={deletedTag => {this.handleChipDeletion(deletedTag, 'keywords')}}
                                required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                value={this.state.workareasNeedAll}
                                displayEmpty
                                name="workarea-operator"
                                onChange={evt => this.handleOperatorChange(evt, 'workareasNeedAll')}
                            >
                                <MenuItem value="All">All of the Work Areas</MenuItem>
                                <MenuItem value="Any">Any of the Work Areas</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['workareas']}
                                selectedItem={this.state.workareas}
                                onAddition={addedTag => {this.handleChipAddition(addedTag, 'workareas')}}
                                onDeletion={deletedTag => {this.handleChipDeletion(deletedTag, 'workareas')}}
                                required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                value={this.state.languagesNeedAll}
                                displayEmpty
                                name="lang-operator"
                                onChange={evt => this.handleOperatorChange(evt, 'languagesNeedAll')}
                            >
                                <MenuItem value="All">All of the Languages</MenuItem>
                                <MenuItem value="Any">Any of the Languages</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['languages']}
                                selectedItem={this.state.languages}
                                onAddition={addedTag => {this.handleChipAddition(addedTag, 'languages')}}
                                onDeletion={deletedTag => {this.handleChipDeletion(deletedTag, 'languages')}}
                                required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                value={this.state.catalogersNeedAll}
                                displayEmpty
                                name="cataloger-operator"
                                onChange={evt => this.handleOperatorChange(evt, 'catalogersNeedAll')}
                            >
                                <MenuItem value="All">All of the Catalogers</MenuItem>
                                <MenuItem value="Any">Any of the Catalogers</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={8}>
                            <AutoCompleteWithChips suggestions={this.props.tags['catalogers']}
                                selectedItem={this.state.catalogers}
                                onAddition={addedTag => {this.handleChipAddition(addedTag, 'catalogers')}}
                                onDeletion={deletedTag => {this.handleChipDeletion(deletedTag, 'catalogers')}}
                                required={true}
                                errorMsg={this.state.fieldErrors.selectedTags} />
                        </Grid>
                    </Grid>
                    {
                        /*
                    <Typography gutterBottom variant="subtitle1" style={{marginTop: '10px'}}>
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
                        tags={this.props.tags}
                    />
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
                            Are you sure you want to delete the folder <b>{this.state.name}</b>?
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
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={Boolean(this.state.message)}
                    onClose={this.handleCloseSnackbar}
                    message={<span>{this.state.message}</span>}
                    ContentProps={{
                        "style": this.getErrorClass()
                    }}
                />
            </Grid>
        );
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

export default DirectoryInfoBoard;
