import axios from 'axios';
import React from 'react';
// import {default as LodashObject} from 'lodash/fp/object';

import Button from 'material-ui/Button';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import SortableTree from 'react-sortable-tree';

import DirlayoutInfoBoard from './dirlayout_info_board.js';
import DirectoryInfoBoard from './directory_info_board.js';

import { withStyles } from 'material-ui/styles';

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
            infoBoardData: {}
        };
        this.handleDirectoryLayoutClick = this.handleDirectoryLayoutClick.bind(this);
        this.handleDirectoryLeftClick = this.handleDirectoryLeftClick.bind(this);
        this.handleDirectoryRightClick = this.handleDirectoryRightClick.bind(this);
        this.createDirectoryLayout = this.createDirectoryLayout.bind(this);
        this.saveDirLayoutCallback = this.saveDirLayoutCallback.bind(this);
        this.deleteDirLayoutCallback = this.deleteDirLayoutCallback.bind(this);
    }

    componentDidMount() {
        // TODO: Try using lodash for deep merge of state
        // this.timerID = setInterval(
        this.timerID = setTimeout(
            () => this.loadData(),
            1000
        );
    }

    componentWillUnmount() {
        // clearInterval(this.timerID);
        clearTimeout(this.timerID);
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
            const currentLayoutInfo = directoryLayoutInfo[eachDir.dir_layout_id];
            const layoutDirectories = currentLayoutInfo.directories;
            if (layoutDirectories[eachDir.id]) {
                layoutDirectories[eachDir.id].id = eachDir.id;
                layoutDirectories[eachDir.id].title = eachDir.name;
                layoutDirectories[eachDir.id].parent = eachDir.parent;
            } else {
                layoutDirectories[eachDir.id] = {
                    id: eachDir.id,
                    title: eachDir.name,
                    parent: eachDir.parent,
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

    loadData() {
        const currInstance = this;
        axios.get('/api/dirlayouts/', {
                responseType: 'json',
            })
            .then(function(response) {
                const dirLayouts = response.data;

                axios.get('/api/directories/', {
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
                        treeData: transformedData
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
                infoBoardData: targetDirLayout
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
            // TODO: Display the right click menu.
            console.log('Need to display the right click menu.');
        }
    }

    createDirectory(evt) {

    }

    createDirectoryLayout(evt) {
        this.setState({
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
                {
                    this.state.treeData[eachDirLayout.id].length > 0 ?
                    <SortableTree
                    treeData={this.state.treeData[eachDirLayout.id]}
                    onChange={newTreeData=> {
                        var currentTreeData = this.state.treeData;
                        currentTreeData[eachDirLayout.id] = newTreeData;
                        this.setState({ treeData: currentTreeData })}
                    }
                    generateNodeProps={nodeInfo => ({
                        onClick: (evt) => this.handleDirectoryLeftClick(nodeInfo, evt),
                        onContextMenu: (evt) => this.handleDirectoryRightClick(nodeInfo, evt)
                    })}
                    />
                    : <Button variant="raised" color="primary">
                        New Directory
                    </Button>
                }
                </Collapse>);
            });

            elements = (
                <div style={{width: '100%'}}>
                    <div style={{width: '30%', cssFloat: 'left', display: 'inline'}}>
                        <Button variant="raised" color="primary" onClick={this.createDirectoryLayout}>
                            New Directory Layout
                        </Button>
                        <List component="nav">
                            <ListSubheader component="div">Directory Layouts</ListSubheader>
                            {
                                accordionItems
                            }

                        </List>
                    </div>
                        {
                            this.state.infoBoardType == BOARD_TYPES.DIRLAYOUT &&
                                <DirlayoutInfoBoard boardData={this.state.infoBoardData} onSave={this.saveDirLayoutCallback} onDelete={this.deleteDirLayoutCallback} />
                        }
                        {
                            this.state.infoBoardType == BOARD_TYPES.DIRECTORY &&
                                <DirectoryInfoBoard boardData={this.state.infoBoardData} />
                        }
                        {
                            this.state.infoBoardType == BOARD_TYPES.NONE &&
                                <div style={{width: '60%', cssFloat: 'right'}}>
                                Nothing to show here.
                                </div>
                        }
                    </div>
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
                treeData: prevState.treeData
            };

            delete newState.treeData[deletedItemId];

            for (var i=0; i<newState.accordionData.length; i++) {
                if (newState.accordionData[i].id == deletedItemId) {
                    newState.accordionData.splice(i, 1);
                }
            }

            return newState;
        });
    }
}

module.exports = DirectoryLayoutComponent;
