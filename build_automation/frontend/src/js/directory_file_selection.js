import React from 'react';

import Typography from 'material-ui/Typography';

import {
    DataTypeProvider,
    FilteringState,
    IntegratedFiltering,
    IntegratedPaging,
    PagingState,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table,
    TableHeaderRow,
    TableFilterRow,
    TableColumnResizing,
    PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

import Chip from 'material-ui/Chip';
import Menu, { MenuItem } from 'material-ui/Menu';

import OpenInNew from 'material-ui-icons/OpenInNew';

var __tagIdsTagsMap = {};

function ChippedTagsFormatter(input) {
    const {row, value} = input;
    const allChips = [];
    value.forEach(eachTagId => {
        allChips.push(<Chip key={row.id + '_' + eachTagId} label={__tagIdsTagsMap[eachTagId]['name']} />);
    });
    return allChips;
};

function ChippedTagsTypeProvider(props) {
    return (<DataTypeProvider formatterComponent={ChippedTagsFormatter} {...props} />);
};

// TODO : Delete this when it is finalized that this piece of code is not needed.
function OpenInNewWindowFormatter(input) {
    const {row, value} = input;
    const targetUrl = value;
    return <OpenInNew onClick={evt => window.open(targetUrl, "_blank")} className="handPointer" title="Open in new window"/>;
}

function LinkTypeProvider(props) {
    return (<DataTypeProvider formatterComponent={OpenInNewWindowFormatter} {...props} />);
};

class FileSelectionComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allFiles: props.allFiles,
            filesPerPage: 10,
            selectedFiles: props.selectedFiles,
            tagIdsTagsMap: props.tagIdsTagsMap,
            allFilesMenu: {
                selectedFile: null,
                AnchorPos: null
            },
            selectedFilesMenu: {
                selectedFile: null,
                AnchorPos: null
            }
        };
        __tagIdsTagsMap = props.tagIdsTagsMap;
        this.handleFilesRightClick = this.handleFilesRightClick.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
        this.tableRowComponent = this.tableRowComponent.bind(this);
        this.addFileToSelection = this.addFileToSelection.bind(this);
        this.removeFileFromSelection = this.removeFileFromSelection.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            allFiles: props.allFiles,
            selectedFiles: props.selectedFiles,
            tagIdsTagsMap: props.tagIdsTagsMap
        });
        __tagIdsTagsMap = props.tagIdsTagsMap;
    }

    handleFilesRightClick(evt, row, menuName) {
        this.setState({
            [menuName]: {
                selectedFile: row,
                AnchorPos: {top:evt.clientY, left:evt.clientX}
            }
        });
        evt.preventDefault();
    }

    handleMenuClose(evt, menuName) {
        this.setState({
            [menuName]: {
                selectedFile: null,
                AnchorPos: null
            }
        });
    }

    addFileToSelection(file) {
        this.setState((prevState, props) => {
            const { selectedFiles } = prevState;
            if ( selectedFiles.indexOf(file) === -1) {
                selectedFiles.push(file);
            }
            return { selectedFiles };
        })
    }

    removeFileFromSelection(file) {
        this.setState((prevState, props) => {
            const { selectedFiles } = prevState;
            selectedFiles.splice(selectedFiles.indexOf(file), 1);
            return { selectedFiles };
        })
    }

    tableRowComponent(obj, menuName)  {
        const {row, children} = obj;
        return(<tr onContextMenu={evt => this.handleFilesRightClick(evt, row, menuName)}>{children}</tr>);
    }

    render() {
        return (
            <React.Fragment>
                <Typography gutterBottom variant="headline" component="h2">
                    Select individual files
                </Typography>
                <Grid
                    rows={this.state.allFiles}
                    columns={[
                        { name: 'name', title: 'Name' },
                        { name: 'description', title: 'Description' },
                        { name: 'tag_ids', title: 'Tags' },
                    ]}
                >
                    <ChippedTagsTypeProvider for={['tag_ids']} />
                    <LinkTypeProvider for={['content_file']} />
                    <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'content_file', filteringEnabled: false}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'allFilesMenu')}} />
                    <TableColumnResizing
                        defaultColumnWidths={[
                            { columnName: 'name', width: 230 },
                            { columnName: 'description', width: 250 },
                            { columnName: 'tag_ids', width: 420 },
                        ]} />
                    <TableHeaderRow />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />
                </Grid>
                <Menu
                    id="all-files-menu"
                    anchorPosition={this.state.allFilesMenu.AnchorPos}
                    anchorReference={'anchorPosition'}
                    open={Boolean(this.state.allFilesMenu.AnchorPos)}
                    onClose={this.handleMenuClose}
                >
                    <MenuItem
                        onClick={evt => {
                            this.addFileToSelection(this.state.allFilesMenu.selectedFile);
                            this.handleMenuClose(evt, 'allFilesMenu');
                        }}
                    >
                        Add this file
                    </MenuItem>
                    <MenuItem
                        onClick={evt => {
                            window.open(this.state.allFilesMenu.selectedFile.content_file, '_blank');
                            this.handleMenuClose(evt, 'allFilesMenu');
                        }}
                    >
                        View this file
                    </MenuItem>
                </Menu>
                <div style={{marginTop: '20px'}}></div>
                <Typography gutterBottom variant="headline" component="h2">
                    Selected Files
                </Typography>
                <Grid
                    rows={this.state.selectedFiles}
                    columns={[
                        { name: 'name', title: 'Name' },
                        { name: 'description', title: 'Description' },
                        { name: 'tag_ids', title: 'Tags' },
                    ]}
                >
                    <ChippedTagsTypeProvider for={['tag_ids']} />
                    <LinkTypeProvider for={['content_file']} />
                    <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'content_file', filteringEnabled: false}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'selectedFilesMenu')}} />
                    <TableColumnResizing
                        defaultColumnWidths={[
                            { columnName: 'name', width: 230 },
                            { columnName: 'description', width: 250 },
                            { columnName: 'tag_ids', width: 420 },
                        ]} />
                    <TableHeaderRow />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />
                </Grid>
                <Menu
                    id="selected-files-menu"
                    anchorPosition={this.state.selectedFilesMenu.AnchorPos}
                    anchorReference={'anchorPosition'}
                    open={Boolean(this.state.selectedFilesMenu.AnchorPos)}
                    onClose={this.handleMenuClose}
                >
                    <MenuItem
                        onClick={evt => {
                            this.removeFileFromSelection(this.state.selectedFilesMenu.selectedFile);
                            this.handleMenuClose(evt, 'selectedFilesMenu');
                        }}
                    >
                        Unselect this file
                    </MenuItem>
                    <MenuItem
                        onClick={evt => {
                            window.open(this.state.selectedFilesMenu.selectedFile.content_file, '_blank');
                            this.handleMenuClose(evt, 'selectedFilesMenu');
                        }}
                    >
                        View this file
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

module.exports = FileSelectionComponent;
