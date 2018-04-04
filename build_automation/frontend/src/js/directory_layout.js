import axios from 'axios';
import React from 'react';
// import {default as LodashObject} from 'lodash/fp/object';

import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import ChevronRight from 'material-ui-icons/ChevronRight';
import Grid from 'material-ui/Grid';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';

import SortableTree from 'react-sortable-tree';

import DirlayoutInfoBoard from './dirlayout_info_board.js';
import DirectoryInfoBoard from './directory_info_board.js';

import { APP_URLS } from './url.js';

import 'react-sortable-tree/style.css';
import '../css/style.css';

const BOARD_TYPES = {
    DIRLAYOUT: 1,
    DIRECTORY: 2,
    NONE: 3
};


/*
 * This component produces two column layout.
 * Left Column - An accordion of directory layouts. The accordion's body will be the
 *      corresponding directory layout's directories (in tree format).
 * Right Column - Display the selected directory layout's / directory's information.
 *
 * State of the component
 * ========================
 * {
 *      isLoaded: boolean - Tells whether the required data is loaded or not.
 *      errorOccurred: boolean - Not used currently. Used to check whether an error was encountered or not.
 *      accordionData: List of <DirectoryLayout> objects
 *                {
 *                      id: Integer - Id of the directory layout.
 *                      name:   String - name of the directory layout.
 *                      description: String - Description of the directory layout.
 *                      isOpen: boolean - Whether the accordion is open or not.
 *                }
 *      treeData: A map of (directory_layout_id --> [<Directory>])
 *              A <Directory> object has the following structure:
 *              {
 *                  id: Integer - Directory Id
 *                  name: String - Name of the directory.
 *                  dirLayoutId: Integer - Owning Directory Layout's ID
 *                  title: String - Currently, the same as name.
 *                  parent: Integer - The parent <Directory>'s id (if present, else null).
 *                  children: [ <Directory> ]
 *              }
 *      infoBoardType: One of BOARD_TYPES
 *          DIRLAYOUT - Directory Layout Screen
 *          DIRECTORY - Directory Screen
 *          NONE - Nothing to display
 *
 *      infoBoardData: Object - For BOARD_TYPES.DIRLAYOUT, this will be <DirectoryLayout> object.
 *                                      See accordionData above for more info.
 *                              For BOARD_TYPES.DIRECTORY, this will be <Directory> object.
 *                                      For more details, refer treeData above.
 *
 *      tagTreeData: Object - A Tree Data containing all the tags. Each <Tag> will be like
 *              {
 *                  id: Integer - Tag Id
 *                  name: String - Name of the Tag
 *                  description: String - Description of the Tag
 *                  title: String - Currently, the same as name.
 *                  parent: Integer - The parent <Tag>'s id (if present, else null).
 *                  children: [ <Directory> ]
 *              }
 * }
 */
class DirectoryLayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            errorOccurred: false,
            accordionData: [],
            treeData: [],
            infoBoardType: BOARD_TYPES.NONE,
            infoBoardData: {},
            tagTreeData: [],
            allFiles: [],
            fileIdFileMap: {},
            dirContextMenu: {
                selectedDirectory: null,
                AnchorPos: null
            },
            selectedDirLayout: null,
            breadCrumb: ' ',
        };
        this.handleDirectoryLayoutClick = this.handleDirectoryLayoutClick.bind(this);
        this.handleDirectoryLeftClick = this.handleDirectoryLeftClick.bind(this);
        this.handleDirectoryRightClick = this.handleDirectoryRightClick.bind(this);
        this.createDirectory = this.createDirectory.bind(this);
        this.createDirectoryLayout = this.createDirectoryLayout.bind(this);
        this.saveDirLayoutCallback = this.saveDirLayoutCallback.bind(this);
        this.deleteDirLayoutCallback = this.deleteDirLayoutCallback.bind(this);
        this.saveDirectoryCallback = this.saveDirectoryCallback.bind(this);
        this.deleteDirectoryCallback = this.deleteDirectoryCallback.bind(this);
        this.removeDirectoryEntry = this.removeDirectoryEntry.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    componentWillUnmount() {
        // clearInterval(this.timerID);
        clearTimeout(this.timerID);
    }

    transformTagsToTreeData(tags) {
        const allTagInfo = {};
        const topLevelTags = [];

        tags.forEach(eachTag => {
            if (allTagInfo[eachTag.id]) {
                allTagInfo[eachTag.id].id = eachTag.id;
                allTagInfo[eachTag.id].name = eachTag.name;
                allTagInfo[eachTag.id].title = (<Button style={{textTransform: 'none'}}>{eachTag.name}</Button>);
                allTagInfo[eachTag.id].parent = eachTag.parent;
                allTagInfo[eachTag.id].description = eachTag.description;
            } else {
                allTagInfo[eachTag.id] = {
                    id: eachTag.id,
                    name: eachTag.name,
                    title: (<Button style={{textTransform: 'none'}}>{eachTag.name}</Button>),
                    parent: eachTag.parent,
                    description: eachTag.description,
                    children: []
                }
            }
            if (eachTag.parent) {
                const currentTagTreeNode = allTagInfo[eachTag.id];
                if (allTagInfo[eachTag.parent]) {
                    allTagInfo[eachTag.parent].children.push(currentTagTreeNode);
                } else {
                    allTagInfo[eachTag.parent] = {children: [currentTagTreeNode]};
                }
            } else {
                topLevelTags.push(eachTag.id);
            }
        });

        const treeData = [];
        topLevelTags.forEach(eachTagId => {
            treeData.push(allTagInfo[eachTagId]);
        });
        return treeData;
    }

    transformDirectoriesToTreeData(dirLayouts, inputData) {
        const directoryLayoutInfo = {};

        dirLayouts.forEach(eachLayout => {
            directoryLayoutInfo[eachLayout.id] = {
                directories: {},
                topLevelDirectories: [],
                treeData: [],
            }
        });

        inputData.forEach(eachDir => {
            const currentLayoutInfo = directoryLayoutInfo[eachDir.dir_layout];
            const layoutDirectories = currentLayoutInfo.directories;
            if (layoutDirectories[eachDir.id]) {
                layoutDirectories[eachDir.id].id = eachDir.id;
                layoutDirectories[eachDir.id].name = eachDir.name;
                layoutDirectories[eachDir.id].title = (
                    <Button fullWidth>{eachDir.name}</Button>
                );
                layoutDirectories[eachDir.id].parent = eachDir.parent;
                layoutDirectories[eachDir.id].dirLayoutId = eachDir.dir_layout;
                layoutDirectories[eachDir.id].filterCriteria = eachDir.filter_criteria;
                layoutDirectories[eachDir.id].individualFiles = eachDir.individual_files;
            } else {
                layoutDirectories[eachDir.id] = {
                    id: eachDir.id,
                    name: eachDir.name,
                    title: (
                        <Button fullWidth>{eachDir.name}</Button>
                    ),
                    dirLayoutId: eachDir.dir_layout,
                    parent: eachDir.parent,
                    filterCriteria: eachDir.filter_criteria,
                    individualFiles: eachDir.individual_files,
                    children: []
                };
            }
            if (eachDir.parent) {
                /* Since the directory has a parent, it is a subdirectory, so add it to the children
                 * list of its parent directory
                 * 1. If the parent already exists in the map, its good. else add the parent to the map. */
                 const currentDirTreeNode = layoutDirectories[eachDir.id];
                if (layoutDirectories[eachDir.parent]) { // If the parent is already present in the map
                    layoutDirectories[eachDir.parent].children.push(currentDirTreeNode);
                } else {
                    layoutDirectories[eachDir.parent] = {children: [currentDirTreeNode]};
                }
            } else {
                // Add it to the top level directories.
                currentLayoutInfo.topLevelDirectories.push(eachDir.id);
            }
        });

        const retval = {};

        Object.keys(directoryLayoutInfo).forEach(eachLayoutId => {
            const currentLayoutInfo = directoryLayoutInfo[eachLayoutId];
            const layoutDirectories = currentLayoutInfo.directories;
            const topLevelDirectories = currentLayoutInfo.topLevelDirectories;
            const treeData = currentLayoutInfo.treeData;
            topLevelDirectories.forEach(topLevelDirId => {
                treeData.push(layoutDirectories[topLevelDirId]);
            })
            retval[eachLayoutId] = treeData;
        });

        return retval;
    };

    buildFileIdFileMap(filesList) {
        const fileIdFileMap = {};
        filesList.forEach(eachFile => {
            fileIdFileMap[eachFile.id] = eachFile;
        });
        return fileIdFileMap;
    }

    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.TAG_LIST, {
            responseType: 'json'
        }).then(function(response) {
            const tagTreeData = currInstance.transformTagsToTreeData(response.data);
            currInstance.setState({
                tagTreeData: tagTreeData,
                tags: response.data
            })
        }).catch(function(error) {
            console.error(error);
            console.error(error.response.data);
        });
        axios.get(APP_URLS.CONTENTS_LIST, {
            responseType: 'json'
        }).then(function(response) {
            const fileIdFileMap = currInstance.buildFileIdFileMap(response.data);
            currInstance.setState({
                allFiles: response.data,
                fileIdFileMap: fileIdFileMap
            })
        }).catch(function(error) {
            console.error(error);
            console.error(error.response.data);
        });
        axios.get(APP_URLS.DIRLAYOUT_LIST, {
                responseType: 'json',
            })
            .then(function(response) {
                const dirLayouts = response.data;

                axios.get(APP_URLS.DIRECTORY_LIST, {
                    responseType: 'json',
                }).then(function(response) {
                    const directories = response.data;
                    const transformedData = currInstance.transformDirectoriesToTreeData(dirLayouts, directories);
                    dirLayouts.forEach(eachDirLayout => {
                        eachDirLayout.isOpen = false;
                    });
                    currInstance.setState((prevState, props) => ({
                        isLoaded: true,
                        accordionData: dirLayouts,
                        treeData: transformedData,
                    }));
                }).catch(function(error) {
                    console.error('Error has occurred when trying to get the directories', error);
                })

            })
            .catch(function(error) {
                console.error('Error has occurred when trying to get the directory layouts.', error);
            });
    };

    handleDirectoryLayoutClick(targetDirLayout, evt) {
        this.setState((prevState, props) => {
            const newState = {
                accordionData: prevState.accordionData,
                infoBoardType: BOARD_TYPES.DIRLAYOUT,
                infoBoardData: targetDirLayout,
                selectedDirLayout: targetDirLayout.id,
                breadCrumb: targetDirLayout.name
            };

            newState.accordionData.forEach(eachDirLayout => {
                if (eachDirLayout.id == targetDirLayout.id) {
                    eachDirLayout.isOpen = !eachDirLayout.isOpen;
                } else {
                    eachDirLayout.isOpen = false;
                }
            });

            return newState;
        });
    }

    handleDirectoryLeftClick(nodeInfo, evt) {
        console.log(nodeInfo);
        const evtTarget = evt.target;
        /* This is used to determine whether the click event was directed at the tree node,
         * or at the expand/collapse buttons in the SortableTree. */
        if (!(evtTarget.className.includes('expandButton') || evtTarget.className.includes('collapseButton'))) {
            this.setState({
                infoBoardType: BOARD_TYPES.DIRECTORY,
                infoBoardData: nodeInfo.node
            })
        }
    }

    handleDirectoryRightClick(nodeInfo, evt) {
        const evtTarget = evt.target;
        /* This is used to determine whether the click event was directed at the tree node,
        * or at the expand/collapse buttons in the SortableTree. */
        if (!(evtTarget.className.includes('expandButton') || evtTarget.className.includes('collapseButton'))) {
            this.setState({
                dirContextMenu: {
                    selectedDirectory: nodeInfo.node.id,
                    AnchorPos: {top:evt.clientY, left:evt.clientX}
                }
            });
        }
        evt.preventDefault();
    }

    handleMenuClose(evt) {
        console.log(evt);
        this.setState({
            dirContextMenu: {
                selectedDirectory: null,
                AnchorPos: null
            }
        });
    }

    createDirectory(dirLayoutId, parentDirId) {
        /*
         * If the parentDirId is null, there is no parent directory and will be created at the root.
         */
        console.log(dirLayoutId, parentDirId);
        this.setState({
            infoBoardType: BOARD_TYPES.DIRECTORY,
            infoBoardData: {
                id: -1,
                name: '',
                filterCriteria: '',
                dirLayoutId: dirLayoutId,
                parent: parentDirId
            }
        });
    }

    createDirectoryLayout(evt) {
        this.setState({
            breadCrumb: '',
            infoBoardType: BOARD_TYPES.DIRLAYOUT,
            infoBoardData: {
                id: -1,
                name: '',
                description: ''
            }
        });
    }

    render() {
        var elements = null;
        if (this.state.isLoaded) {
            var accordionItems = [];
            this.state.accordionData.forEach(eachDirLayout => {
                accordionItems.push(<ListItem button key={eachDirLayout.id} onClick={evt => this.handleDirectoryLayoutClick(eachDirLayout, evt)}>
                    <ListItemText inset primary={ eachDirLayout.name } />
                { eachDirLayout.isOpen ? <ExpandLess /> : <ExpandMore /> }
                </ListItem>);
                accordionItems.push(<Collapse key={'collapse-' + eachDirLayout.id} in={eachDirLayout.isOpen} timeout="auto" unmountOnExit>
                <Button variant="raised" color="primary" onClick={evt => {this.createDirectory(eachDirLayout.id, null); }}>
                        New Directory
                </Button>
                {
                    this.state.treeData[eachDirLayout.id].length > 0 &&
                    <SortableTree
                    treeData={this.state.treeData[eachDirLayout.id]}
                    onChange={newTreeData=> {
                        var currentTreeData = this.state.treeData;
                        currentTreeData[eachDirLayout.id] = newTreeData;
                        this.setState({ treeData: currentTreeData })}
                    }
                    isVirtualized={false}
                    generateNodeProps={nodeInfo => ({
                        onClick: (evt) => this.handleDirectoryLeftClick(nodeInfo, evt),
                        onContextMenu: (evt) => this.handleDirectoryRightClick(nodeInfo, evt)
                    })}
                    />
                }
                </Collapse>);
            });

            elements = (
                <Grid container spacing={8}>
                    <Grid item xs={3} style={{paddingLeft: '20px'}}>
                        <Button variant="raised" color="primary" onClick={this.createDirectoryLayout}>
                            New Directory Layout
                        </Button>
                        <List component="nav">
                            <ListSubheader disableSticky component="div">Directory Layouts</ListSubheader>
                            {
                                accordionItems
                            }
                        </List>
                    </Grid>
                    <Grid item xs={8}>
                        <AppBar position="static" style={{ minHeight: '50px', margin: 'auto', padding: '10px auto 10px 10px'}}>
                            <Typography gutterBottom variant="subheading" style={{color: '#ffffff', verticalAlign: 'middle'}}>
                            {this.state.breadCrumb}
                            <ChevronRight style={{verticalAlign: 'middle'}}/>
                            </Typography>
                        </AppBar>
                        <div style={{marginTop: '20px'}}> </div>
                        {
                            this.state.infoBoardType == BOARD_TYPES.DIRLAYOUT &&
                                <DirlayoutInfoBoard boardData={this.state.infoBoardData} onSave={this.saveDirLayoutCallback} onDelete={this.deleteDirLayoutCallback} />
                        }
                        {
                            this.state.infoBoardType == BOARD_TYPES.DIRECTORY &&
                                <DirectoryInfoBoard boardData={this.state.infoBoardData} onSave={this.saveDirectoryCallback} onDelete={this.deleteDirectoryCallback} tagTreeData={this.state.tagTreeData} tags={this.state.tags} allFiles={this.state.allFiles} fileIdFileMap={this.state.fileIdFileMap} />
                        }
                        {
                            this.state.infoBoardType == BOARD_TYPES.NONE &&
                                <span>Nothing to show here.</span>
                        }
                    </Grid>
                    <Menu
                        id="simple-menu"
                        anchorPosition={this.state.dirContextMenu.AnchorPos}
                        anchorReference={'anchorPosition'}
                        open={Boolean(this.state.dirContextMenu.AnchorPos)}
                        onClose={this.handleMenuClose}
                    >
                        <MenuItem
                            onClick={evt => {
                                this.createDirectory(this.state.selectedDirLayout, this.state.dirContextMenu.selectedDirectory);
                                this.handleMenuClose(evt);
                            }}
                        >
                            Create Directory
                        </MenuItem>
                    </Menu>
                </Grid>
                );
        } else {
            elements = (
                <div>Loading...</div>
            )
        }

        return elements;
    }

    saveDirLayoutCallback(savedInfo, created=false) {
        this.setState((prevState, props) => {
            const newState = {
                accordionData: prevState.accordionData,
                infoBoardData: savedInfo,
                breadCrumb: savedInfo.name,
            };

            if (created) {
                const newDirLayout = {
                    id: savedInfo.id,
                    name: savedInfo.name,
                    description: savedInfo.description,
                    isOpen: false
                };

                newState.treeData = prevState.treeData;
                newState.treeData[savedInfo.id] = [];
                newState.accordionData.push(newDirLayout);
            } else {
                newState.accordionData.forEach(eachDirLayout => {
                    if (eachDirLayout.id == savedInfo.id) {
                        eachDirLayout.name = savedInfo.name;
                        eachDirLayout.description = savedInfo.description;
                    }
                });
            }

            return newState;
        });
    }

    deleteDirLayoutCallback(deletedItemId) {
        this.setState((prevState, props) => {
            const newState = {
                infoBoardType: BOARD_TYPES.NONE,
                infoBoardData: {},
                accordionData: prevState.accordionData,
                treeData: prevState.treeData,
                selectedDirLayout: null,
                breadCrumb: ' '
            };

            delete newState.treeData[deletedItemId];

            for (var i=0; i<newState.accordionData.length; i++) {
                if (newState.accordionData[i].id == deletedItemId) {
                    newState.accordionData.splice(i, 1);
                    break;
                }
            }

            return newState;
        });
    }

    updateDirectoryEntry(directoryId, array, newValue, created) {
        for (var i=0; i<array.length; i++) {
            if (array[i].id == directoryId) {
                if (created) {
                    // If the operation is a create operation
                    array[i].children.push({
                        id: newValue.id,
                        name: newValue.name,
                        title: (<Button fullWidth>{newValue.name}</Button>),
                        dirLayoutId: newValue.dir_layout,
                        parent: newValue.parent,
                        filterCriteria: newValue.filter_criteria,
                        individualFiles: newValue.individual_files,
                        children: []
                    });
                } else {
                    // If the operation is an update operation
                    array[i].name = newValue.name;
                    array[i].title = (<Button fullWidth>{newValue.name}</Button>);
                    array[i].parent = newValue.parent;
                    array[i].filterCriteria = newValue.filter_criteria;
                    array[i].individualFiles = newValue.individual_files;
                }
                return true;
            }
            if (array[i].children.length > 0) {
                var found = this.updateDirectoryEntry(directoryId, array[i].children, newValue, created);
                if (found) {
                    return true;
                }
            }
        }
        return false;
    }

    saveDirectoryCallback(savedInfo, created=false) {
        this.setState((prevState, props) => {
            const dirLayoutId = savedInfo.dir_layout;
            const newState = {
                treeData: prevState.treeData
            }

            if (created) {
                if (savedInfo.parent) {
                    // Add it to the parent.
                    this.updateDirectoryEntry(savedInfo.parent, newState.treeData[dirLayoutId], savedInfo, created);
                } else {
                    // Add it as a top level directory for the layout.
                    newState.treeData[dirLayoutId].push({
                        id: savedInfo.id,
                        name: savedInfo.name,
                        title: (<Button>{savedInfo.name}</Button>),
                        dirLayoutId: savedInfo.dir_layout,
                        parent: savedInfo.parent,
                        filterCriteria: savedInfo.filter_criteria,
                        individualFiles: savedInfo.individual_files,
                        children: []
                    });
                }
            } else {
                // Update the existing value.
                this.updateDirectoryEntry(savedInfo.id, newState.treeData[dirLayoutId], savedInfo, created);
            }

            return newState;
        });
    }

    /* Remove the directory entry from the array */
    removeDirectoryEntry(directoryId, array) {
        for (var i=0; i<array.length; i++) {
            if (array[i].id == directoryId) {
                array.splice(i, 1);
                return true;
            }
            if (array[i].children.length > 0) {
                var found = this.removeDirectoryEntry(directoryId, array[i].children);
                if (found) {
                    return true;
                }
            }
        }
        return false;
    }

    deleteDirectoryCallback(dirLayoutId, directoryId) {
        this.setState((prevState, props) => {
            const newState = {
                infoBoardType: BOARD_TYPES.NONE,
                infoBoardData: {},
                treeData: prevState.treeData,
                breadCrumb: ' '
            };

            this.removeDirectoryEntry(directoryId, newState.treeData[dirLayoutId]);

            return newState;
        });
    }
}

module.exports = DirectoryLayoutComponent;
