import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import axios from 'axios';
// import {default as LodashObject} from 'lodash/fp/object';
import React from 'react';
import SortableTree from 'react-sortable-tree';

import DirlayoutInfoBoard from './dirlayout_info_board.js';
import DirectoryInfoBoard from './directory_info_board.js';

import 'react-accessible-accordion/dist/fancy-example.css';
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
                    description: eachDir.description,
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

        Object.keys(directoryLayoutInfo).forEach(eachLayoutId => {
            const currentLayoutInfo = directoryLayoutInfo[eachLayoutId];
            const layoutDirectories = currentLayoutInfo.directories;
            const topLevelDirectories = currentLayoutInfo.topLevelDirectories;
            const treeData = currentLayoutInfo.treeData;
            topLevelDirectories.forEach(topLevelDirId => {
                treeData.push(layoutDirectories[topLevelDirId]);
            })
            delete currentLayoutInfo.directories;
            delete currentLayoutInfo.topLevelDirectories;
        });
        return directoryLayoutInfo;
    }

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
                    console.log(transformedData);
                    currInstance.setState((prevState, props) => ({
                        isLoaded: true,
                        accordionData: dirLayouts,
                        treeData: transformedData
                    }));
                }).catch(function(error) {
                    console.error('Error has occurred when trying to get the directories');
                    console.log(error);
                })

            })
            .catch(function(error) {
                console.error('Error has occurred when trying to get the directory layouts.');
                console.log(error);
            });
    }

    handleDirectoryLayoutClick(dirLayout, evt) {
        console.log(evt.target);
        this.setState({
            infoBoardType: BOARD_TYPES.DIRLAYOUT,
            infoBoardData: dirLayout
        });
    }

    handleDirectoryLeftClick(nodeInfo, evt) {
        const evtTarget = evt.target;

        /* This is used to determine whether the click event was directed at the tree node,
         * or at the expand/collapse buttons in the SortableTree. */
        if (!(evtTarget.className.includes('expandButton') || evtTarget.className.includes('collapseButton'))) {
            console.log(nodeInfo.node);
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
            console.log('Need to display the right click menu.');
        }
    }

    render() {
        var elements = null;
        if (this.state.isLoaded) {
            elements = (
                <div style={{width: '100%'}}>
                    <div style={{width: '30%', cssFloat: 'left', display: 'inline'}}>
                        <Accordion>
                            {
                                this.state.accordionData.map(eachDirLayout =>
                                    <AccordionItem key={eachDirLayout.id}>
                                    <AccordionItemTitle>
                                    <h3 onClick={evt => this.handleDirectoryLayoutClick(eachDirLayout, evt)}> { eachDirLayout.name } </h3>
                                    </AccordionItemTitle>
                                    <AccordionItemBody>
                                        {
                                            this.state.treeData[eachDirLayout.id].treeData.length > 0 ?
                                            <SortableTree
                                                treeData={this.state.treeData[eachDirLayout.id].treeData}
                                                onChange={newTreeData=> {
                                                    var currentTreeData = this.state.treeData;
                                                    currentTreeData[eachDirLayout.id].treeData = newTreeData;
                                                    this.setState({ treeData: currentTreeData })}
                                                }
                                                generateNodeProps={nodeInfo => ({
                                                    onClick: (evt) => this.handleDirectoryLeftClick(nodeInfo, evt),
                                                    onContextMenu: (evt) => this.handleDirectoryRightClick(nodeInfo, evt)
                                                })}
                                            />
                                            : <input type="button" value="Create a directory" />
                                        }
                                        </AccordionItemBody>
                                        </AccordionItem>
                                )
                            }
                            </Accordion>
                        </div>
                        {
                            this.state.infoBoardType == BOARD_TYPES.DIRLAYOUT &&
                                <DirlayoutInfoBoard boardData={this.state.infoBoardData} />
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
}

module.exports = DirectoryLayoutComponent;
