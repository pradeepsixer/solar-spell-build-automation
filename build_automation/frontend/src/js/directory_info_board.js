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
import { APP_URLS, get_url } from './url.js';

import 'react-sortable-tree/style.css';

class DirectoryInfoBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            filterCriteria: props.boardData.filterCriteria,
            parent: props.boardData.parent,
            tagTreeData: props.tagTreeData,
            tags: props.tags,
            selectedTags: this.getSelectedTagsFromFilterCriteria(props.boardData.filterCriteria)
        };

        console.log(this.state);
        this.saveDirectory = this.saveDirectory.bind(this);
        this.deleteDirectory = this.deleteDirectory.bind(this);
        this.saveCallback = this.props.onSave.bind(this);
        this.deleteCallback = this.props.onDelete.bind(this);
        this.handleChipAddition = this.handleChipAddition.bind(this);
    }

    getSelectedTagsFromFilterCriteria(filterCriteria) {
        if (!filterCriteria) {
            return [];
        }
        // TODO Change this to parse the Filter Criteria
        return [];
    }

    componentWillReceiveProps(props) {
        this.setState({
            id: props.boardData.id,
            dirLayoutId: props.boardData.dirLayoutId,
            name: props.boardData.name,
            filterCriteria: props.boardData.filterCriteria,
            parent: props.boardData.parent,
            tagTreeData: props.tagTreeData,
            tags: props.tags
        });
    }

    saveDirectory(evt) {
        var targetUrl = APP_URLS.DIRECTORY_LIST;
        const payload = {
            name: this.state.name,
            dir_layout: this.state.dirLayoutId,
            filter_criteria: this.state.filterCriteria,
            parent: this.state.parent
        };

        // TODO : Delete this later.
        payload.filter_criteria = '(1 OR 2)';
        console.log('Payload is ', payload);
        const currInstance = this;
        if (this.state.id > 0) {
            // Update an existing directory.
            targetUrl = get_url(APP_URLS.DIRECTORY_DETAIL, {id:this.state.id});
            axios.patch(targetUrl, payload, {
                responseType: 'json'
            }).then(function(response) {
                currInstance.saveCallback(response.data);
            }).catch(function(error) {
                console.error("Error in updating the directory", error);
            });
        } else {
            // Create a new directory.
            payload.filter_criteria = '(1 OR 2)'; // TODO: Change this to a proper one once the autocomplete is done.
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
        this.setState({
            [stateProperty]: evt.target.value
        })
    }

    /* Called when a chip is added to the autocomplete component. */
    handleChipAddition(addedChip) {
        console.log(addedChip);
        this.setState((prevState, props) => {
            const newState = {
                selectedTags: prevState.selectedTags
            }
            newState.selectedTags.push(addedChip);
            return {}; // TODO: Change this
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
                                value={'all'}
                                onChange={evt => console.log(evt)}
                                displayEmpty
                                name="tag-option"
                            >
                                <MenuItem value="all">All of the tags</MenuItem>
                                <MenuItem value="any">Any of the tags</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={10}>
                            <AutoCompleteWithChips suggestions={this.state.tags} searchKey={'name'} selectedItem={[]} onChange={evt => console.log(evt)}/>
                        </Grid>
                    </Grid>
                    <div style={{marginTop: '20px'}}></div>
                    <Typography gutterBottom variant="headline" component="h2">
                        Individual Files
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <SortableTree
                    treeData={this.state.tagTreeData}
                    onChange={newTreeData => {
                        this.setState({tagTreeData: newTreeData});
                    }}
                    canDrag={false}
                    generateNodeProps={nodeInfo => ({
                        onClick: (evt) => this.handleTagClick(nodeInfo, evt),
                    })}
                    />
                </Grid>
            </Grid>
        );
    }

    handleTagClick(nodeInfo, evt) {
        console.log(nodeInfo);
    }
}

module.exports = DirectoryInfoBoard;
