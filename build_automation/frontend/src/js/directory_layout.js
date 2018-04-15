import axios from 'axios';
import React from 'react';
import cloneDeep from 'lodash/fp/cloneDeep';

import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import ChevronRight from 'material-ui-icons/ChevronRight';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Grid from 'material-ui/Grid';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import Snackbar from 'material-ui/Snackbar';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';

import SortableTree from 'react-sortable-tree';

import DirlayoutInfoBoard from './dirlayout_info_board.js';
import DirectoryInfoBoard from './directory_info_board.js';

import { DIRLAYOUT_SAVE_TYPE } from './constants.js';
import { APP_URLS } from './url.js';
import { buildMapFromArray } from './utils.js';

import 'react-sortable-tree/style.css';

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
            allFiles: [],
            fileIdFileMap: {},
            dirContextMenu: {
                selectedDirectory: null,
                AnchorPos: null
            },
            selectedDirLayout: null,
            breadCrumb: [],
            message: null,
            messageType: 'info'
        };
        this.directoryIdDirectoryMap = null;

        this.getBreadCrumbs = this.getBreadCrumbs.bind(this);
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
        this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this);
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
            if (! layoutDirectories[eachDir.id]) {
                layoutDirectories[eachDir.id] = {
                    children: []
                }
            }
            layoutDirectories[eachDir.id].id = eachDir.id;
            layoutDirectories[eachDir.id].name = eachDir.name;
            layoutDirectories[eachDir.id].title = (
                <Button fullWidth>{eachDir.name}</Button>
            );
            layoutDirectories[eachDir.id].parent = eachDir.parent;
            layoutDirectories[eachDir.id].dirLayoutId = eachDir.dir_layout;
            layoutDirectories[eachDir.id].bannerFile = eachDir.banner_file;
            layoutDirectories[eachDir.id].originalFileName = eachDir.original_file_name;
            layoutDirectories[eachDir.id].individualFiles = eachDir.individual_files;
            layoutDirectories[eachDir.id].creators = eachDir.creators;
            layoutDirectories[eachDir.id].coverages = eachDir.coverages;
            layoutDirectories[eachDir.id].subjects = eachDir.subjects;
            layoutDirectories[eachDir.id].keywords = eachDir.keywords;
            layoutDirectories[eachDir.id].workareas = eachDir.workareas;
            layoutDirectories[eachDir.id].languages = eachDir.languages;
            layoutDirectories[eachDir.id].catalogers = eachDir.catalogers;

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
            });
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
        axios.get(APP_URLS.ALLTAGS_LIST, {
            responseType: 'json'
        }).then(function(response) {
            currInstance.setState({
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
                    currInstance.directoryIdDirectoryMap = buildMapFromArray(response.data, 'id');
                    const transformedData = currInstance.transformDirectoriesToTreeData(dirLayouts, directories);
                    dirLayouts.forEach(eachDirLayout => {
                        eachDirLayout.isOpen = false;
                    });
                    currInstance.setState((prevState, props) => ({
                        isLoaded: true,
                        accordionData: dirLayouts,
                        treeData: transformedData,
                        infoBoardType: BOARD_TYPES.NONE,
                        infoBoardData: {},
                        breadCrumb: []
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
                selectedDirLayout: targetDirLayout,
                breadCrumb: this.getBreadCrumbs(targetDirLayout, null)
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

    getBreadCrumbs(dirLayout, currentDir) {
        const breadCrumbs = [];
        while (currentDir) {
            breadCrumbs.unshift(currentDir.name);
            currentDir = this.directoryIdDirectoryMap[currentDir.parent];
        }
        breadCrumbs.unshift(dirLayout.name);
        return breadCrumbs;
    }

    handleDirectoryLeftClick(nodeInfo, evt) {
        const evtTarget = evt.target;
        /* This is used to determine whether the click event was directed at the tree node,
         * or at the expand/collapse buttons in the SortableTree. */
        if (!(evtTarget.className.includes('expandButton') || evtTarget.className.includes('collapseButton'))) {
            this.setState((prevState, props) => {
                return {
                    breadCrumb: this.getBreadCrumbs(prevState.selectedDirLayout, nodeInfo.node),
                    infoBoardType: BOARD_TYPES.DIRECTORY,
                    infoBoardData: nodeInfo.node
                }
            });
        }
    }

    handleDirectoryRightClick(nodeInfo, evt) {
        const evtTarget = evt.target;
        /* This is used to determine whether the click event was directed at the tree node,
        * or at the expand/collapse buttons in the SortableTree. */
        if (!(evtTarget.className.includes('expandButton') || evtTarget.className.includes('collapseButton'))) {
            this.setState({
                dirContextMenu: {
                    selectedDirectory: nodeInfo.node,
                    AnchorPos: {top:evt.clientY, left:evt.clientX}
                }
            });
        }
        evt.preventDefault();
    }

    handleMenuClose(evt) {
        this.setState({
            dirContextMenu: {
                selectedDirectory: null,
                AnchorPos: null
            }
        });
    }

    createDirectory(dirLayout, parentDir) {
        /*
         * If the parentDirId is null, there is no parent directory and will be created at the root.
         */
        this.setState((prevState, props) => {
            return {
            breadCrumb: this.getBreadCrumbs(dirLayout, parentDir),
            infoBoardType: BOARD_TYPES.DIRECTORY,
            infoBoardData: {
                id: -1,
                name: '',
                individualFiles: [],
                bannerFile: '',
                originalFileName: '',
                creators: [],
                coverages: [],
                subjects: [],
                keywords: [],
                workareas: [],
                languages: [],
                catalogers: [],
                dirLayoutId: dirLayout.id,
                parent: Boolean(parentDir) ? parentDir.id : null,
            }
        }});
    }

    createDirectoryLayout(evt) {
        this.setState({
            breadCrumb: [],
            infoBoardType: BOARD_TYPES.DIRLAYOUT,
            infoBoardData: {
                id: -1,
                name: '',
                description: '',
                original_file_name: '',
                banner_file: ''
            }
        });
    }

    render() {
        var elements = null;
        if (this.state.isLoaded) {
            const accordionItems = [];
            this.state.accordionData.forEach(eachDirLayout => {
                accordionItems.push(<ListItem button key={eachDirLayout.id} onClick={evt => this.handleDirectoryLayoutClick(eachDirLayout, evt)}>
                    <ListItemText inset primary={ eachDirLayout.name } />
                { eachDirLayout.isOpen ? <ExpandLess /> : <ExpandMore /> }
                </ListItem>);
                accordionItems.push(<Collapse key={'collapse-' + eachDirLayout.id} in={eachDirLayout.isOpen} timeout="auto" unmountOnExit>
                <Button variant="raised" color="primary" onClick={evt => {this.createDirectory(eachDirLayout, null); }} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}>
                        New Top Folder
                </Button>
                <div className={'autoScrollX'}>
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
                </div>
                </Collapse>);
                accordionItems.push(<Divider key={'divider_' + eachDirLayout.id} />);
            });

            const breadCrumbItems = [];
            for (let i=0; i<this.state.breadCrumb.length; i++) {
                const eachCrumb = this.state.breadCrumb[i];
                breadCrumbItems.push(<span key={'bcrumb_' + i}>
                    {eachCrumb}
                    <ChevronRight style={{verticalAlign: 'middle'}}/>
                    </span>);
            }

            elements = (
                <Grid container spacing={8}>
                    <Grid item xs={3} style={{paddingLeft: '20px'}}>
                        <Button variant="raised" color="primary" onClick={this.createDirectoryLayout} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}>
                            New Library Version
                        </Button>
                        <List component="nav">
                            <ListSubheader disableSticky component="div">Library Versions</ListSubheader>
                            {
                                accordionItems
                            }
                        </List>
                    </Grid>
                    <Grid item xs={8}>
                        <AppBar position="static" style={{ minHeight: '50px', margin: 'auto', padding: '13px 0px 7px 10px'}}>
                            <Typography gutterBottom variant="subheading" style={{color: '#ffffff'}}>
                            {
                                breadCrumbItems
                            }
                            </Typography>
                        </AppBar>
                        <div style={{marginTop: '20px'}}> </div>
                        {
                            this.state.infoBoardType == BOARD_TYPES.DIRLAYOUT &&
                                <DirlayoutInfoBoard boardData={this.state.infoBoardData} onSave={this.saveDirLayoutCallback} onDelete={this.deleteDirLayoutCallback} />
                        }
                        {
                            this.state.infoBoardType == BOARD_TYPES.DIRECTORY &&
                                <DirectoryInfoBoard boardData={this.state.infoBoardData} onSave={this.saveDirectoryCallback} onDelete={this.deleteDirectoryCallback} tags={this.state.tags} allFiles={this.state.allFiles} fileIdFileMap={this.state.fileIdFileMap} />
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
                            Create SubFolder
                        </MenuItem>
                    </Menu>
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        open={Boolean(this.state.message)}
                        autoHideDuration={6000}
                        onClose={this.handleCloseSnackbar}
                        message={<span>{this.state.message}</span>}
                    />
                </Grid>
                );
        } else {
            elements = (
                <div>Loading...</div>
            )
        }

        return elements;
    }

    handleCloseSnackbar() {
        this.setState({
            message: null,
            messageType: 'info'
        })
    }

    saveDirLayoutCallback(savedInfo, saveType) {
        if (saveType == DIRLAYOUT_SAVE_TYPE.CLONE) {
            // TODO : Create a new endpoint for getting the directories associated with a layout, and reload just them.
            this.loadData();
            this.setState({
                message: 'Successfully cloned the library version.',
                messageType: 'info'
            });
        } else {
            this.setState((prevState, props) => {
                const newState = {
                    accordionData: prevState.accordionData,
                    infoBoardData: savedInfo,
                    breadCrumb: [savedInfo.name],
                };

                if (saveType == DIRLAYOUT_SAVE_TYPE.CREATE) {
                    const newDirLayout = {
                        id: savedInfo.id,
                        name: savedInfo.name,
                        description: savedInfo.description,
                        original_file_name: savedInfo.original_file_name,
                        banner_file: savedInfo.banner_file,
                        isOpen: false
                    };

                    newState.treeData = prevState.treeData;
                    newState.treeData[savedInfo.id] = [];
                    newState.accordionData.push(newDirLayout);
                } else if (saveType == DIRLAYOUT_SAVE_TYPE.UPDATE) {
                    newState.accordionData.forEach(eachDirLayout => {
                        if (eachDirLayout.id == savedInfo.id) {
                            eachDirLayout.name = savedInfo.name;
                            eachDirLayout.description = savedInfo.description;
                            eachDirLayout.banner_file = savedInfo.banner_file;
                            eachDirLayout.original_file_name = savedInfo.original_file_name;
                        }
                    });
                }

                return newState;
            });
        }
    }

    deleteDirLayoutCallback(deletedItemId) {
        this.setState((prevState, props) => {
            const newState = {
                infoBoardType: BOARD_TYPES.NONE,
                infoBoardData: {},
                accordionData: prevState.accordionData,
                treeData: prevState.treeData,
                selectedDirLayout: null,
                breadCrumb: []
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
                    array[i].children = array[i].children.concat({
                        id: newValue.id,
                        name: newValue.name,
                        title: (<Button fullWidth>{newValue.name}</Button>),
                        dirLayoutId: newValue.dir_layout,
                        parent: newValue.parent,
                        bannerFile: newValue.banner_file,
                        originalFileName: newValue.original_file_name,
                        individualFiles: newValue.individual_files,
                        creators: newValue.creators,
                        coverages: newValue.coverages,
                        subjects: newValue.subjects,
                        keywords: newValue.keywords,
                        workareas: newValue.workareas,
                        languages: newValue.languages,
                        catalogers: newValue.catalogers,
                        children: []
                    });
                } else {
                    // If the operation is an update operation
                    array[i].name = newValue.name;
                    array[i].title = (<Button fullWidth>{newValue.name}</Button>);
                    array[i].parent = newValue.parent;
                    array[i].bannerFile = newValue.banner_file;
                    array[i].originalFileName = newValue.original_file_name;
                    array[i].individualFiles = newValue.individual_files;
                    array[i].creators = newValue.creators;
                    array[i].coverages = newValue.coverages;
                    array[i].subjects = newValue.subjects;
                    array[i].keywords = newValue.keywords;
                    array[i].workareas = newValue.workareas;
                    array[i].languages = newValue.languages;
                    array[i].catalogers = newValue.catalogers;
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

    updateBoardData(boardData, directory) {
        boardData.id = directory.id;
        boardData.name = directory.name;
        boardData.dirLayoutId = directory.dir_layout;
        boardData.bannerFile = directory.banner_file;
        boardData.originalFileName = directory.original_file_name;
        boardData.individualFiles = directory.individual_files;
        boardData.creators = directory.creators;
        boardData.coverages = directory.coverages;
        boardData.subjects = directory.subjects;
        boardData.keywords = directory.keywords;
        boardData.workareas = directory.workareas;
        boardData.languages = directory.languages;
        boardData.catalogers = directory.catalogers;
        boardData.parent = directory.parent;
    }

    saveDirectoryCallback(savedInfo, created=false) {
        this.setState((prevState, props) => {
            const dirLayoutId = savedInfo.dir_layout;
            const newState = {
                breadCrumb: this.getBreadCrumbs(prevState.selectedDirLayout, savedInfo),
                treeData: cloneDeep(prevState.treeData),
                infoBoardData: cloneDeep(prevState.treeData)
            };

            this.updateBoardData(newState.infoBoardData, savedInfo);

            if (created) {
                if (savedInfo.parent) {
                    // Add it to the parent.
                    this.updateDirectoryEntry(savedInfo.parent, newState.treeData[dirLayoutId], savedInfo, created);
                } else {
                    // Add it as a top level directory for the layout.
                    newState.treeData[dirLayoutId] = newState.treeData[dirLayoutId].concat({
                        id: savedInfo.id,
                        name: savedInfo.name,
                        title: (<Button>{savedInfo.name}</Button>),
                        dirLayoutId: savedInfo.dir_layout,
                        parent: savedInfo.parent,
                        bannerFile: savedInfo.banner_file,
                        originalFileName: savedInfo.original_file_name,
                        individualFiles: savedInfo.individual_files,
                        creators: savedInfo.creators,
                        coverages: savedInfo.coverages,
                        subjects: savedInfo.subjects,
                        keywords: savedInfo.keywords,
                        workareas: savedInfo.workareas,
                        languages: savedInfo.languages,
                        catalogers: savedInfo.catalogers,
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
                treeData: cloneDeep(prevState.treeData),
                breadCrumb: []
            };

            this.removeDirectoryEntry(directoryId, newState.treeData[dirLayoutId]);

            return newState;
        });
    }
}

module.exports = DirectoryLayoutComponent;
