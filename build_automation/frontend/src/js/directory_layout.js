import axios from 'axios';
import React from 'react';

import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';

import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

class DirectoryLayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            errorOccurred: false,
            accordionData: [],
            treeData: []
        }
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
            } else {
                layoutDirectories[eachDir.id] = {
                    id: eachDir.id,
                    title: eachDir.name,
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

    render() {
        var elements = null;
        if (this.state.isLoaded) {
            elements = (
                <div style={{width: '100%'}}>
                <div style={{width: '30%'}}>
                <Accordion>
                {
                    this.state.accordionData.map(eachDirLayout =>
                        <AccordionItem key={eachDirLayout.id}>
                        <AccordionItemTitle>
                        <h3> { eachDirLayout.name } </h3>
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
                                    generateNodeProps={rowInfo => ({onClick: (evt) => {console.log('Left Click on ', rowInfo, evt);}, onContextMenu: (evt) => {console.log('Right Click on ', rowInfo, evt.target);}})}
                                />
                                : <input type="button" value="Create a directory" />
                            }
                            </AccordionItemBody>
                            </AccordionItem>
                        )
                    }
                    </Accordion>
                    </div>
                    <div style={{width: '40%'}}>
                    </div>
                    <div style={{width: '30%'}}>
                    </div>
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
