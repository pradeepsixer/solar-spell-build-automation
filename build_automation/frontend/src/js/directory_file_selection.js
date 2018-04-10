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
    ColumnChooser,
    Grid,
    Table,
    TableHeaderRow,
    TableFilterRow,
    TableColumnResizing,
    TableColumnVisibility,
    Toolbar,
    PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

import { TableRow } from 'material-ui/Table';

import Chip from 'material-ui/Chip';
import Menu, { MenuItem } from 'material-ui/Menu';

import OpenInNew from 'material-ui-icons/OpenInNew';

var __tagIdsTagsMap = {};

function ChippedTagsFormatter(input) {
    if (!input) {
        return [];
    }
    const {row, column, value} = input;
    const allChips = [];
    var columnName = column['name'];
    if(Array.isArray(value)) {
        value.forEach(eachTagId => {
            allChips.push(<Chip key={row.id + '_' + columnName + '_' + eachTagId} label={__tagIdsTagsMap[columnName][eachTagId]['name']} />);
        });
    } else if (Number.isInteger(value)) {
        columnName += 's'; // To match the languages, catalogers and coverages.
        allChips.push(<Chip key={row.id + '_' + columnName + '_' + input} label={__tagIdsTagsMap[columnName][value]['name']} />);
    }
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
        const selectedFiles = this.getSelectedFilesFromFileIds(props.selectedFiles, props.fileIdFileMap);
        this.state = {
            selectedFiles: selectedFiles,
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
        this.selectCallback = props.onFileSelect;
        this.deselectCallback = props.onFileDeselect;
    }

    /*
     * Get the File Information object from the list of File IDs
     */
    getSelectedFilesFromFileIds(fileIds, fileIdFileMap) {
        return fileIds.map(eachFileId => fileIdFileMap[eachFileId]);
    }

    componentWillReceiveProps(props) {
        const selectedFiles = this.getSelectedFilesFromFileIds(props.selectedFiles, props.fileIdFileMap);
        this.setState({
            selectedFiles: selectedFiles,
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
        if (this.selectCallback) {
            this.selectCallback(file);
        }
    }

    removeFileFromSelection(file) {
        if (this.deselectCallback) {
            this.deselectCallback(file);
        }
    }

    tableRowComponent(obj, menuName)  {
        const {row, children} = obj;
        return(<TableRow onContextMenu={evt => this.handleFilesRightClick(evt, row, menuName)}>{children}</TableRow>);
    }

    render() {
        return (
            <React.Fragment>
                <Typography gutterBottom variant="headline" component="h2">
                    Select individual files
                </Typography>
                <Grid
                    rows={this.props.allFiles}
                    columns={[
                        { name: 'name', title: 'Name' },
                        { name: 'description', title: 'Description' },
                        { name: 'creators', title: 'Creators' },
                        { name: 'coverage', title: 'Coverage' },
                        { name: 'subjects', title: 'Subjects' },
                        { name: 'keywords', title: 'Keywords' },
                        { name: 'workareas', title: 'Workareas' },
                        { name: 'language', title: 'Language' },
                        { name: 'cataloger', title: 'Cataloger' },
                    ]}
                >
                    <ChippedTagsTypeProvider for={['creators', 'coverage', 'subjects', 'keywords', 'workareas', 'language', 'cataloger']} />
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
                            { columnName: 'creators', width: 420 },
                            { columnName: 'coverage', width: 420 },
                            { columnName: 'subjects', width: 420 },
                            { columnName: 'keywords', width: 420 },
                            { columnName: 'workareas', width: 420 },
                            { columnName: 'language', width: 80 },
                            { columnName: 'cataloger', width: 80 },
                        ]} />
                    <TableHeaderRow />
                    <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />
                </Grid>
                <Menu
                    id="all-files-menu"
                    anchorPosition={this.state.allFilesMenu.AnchorPos}
                    anchorReference={'anchorPosition'}
                    open={Boolean(this.state.allFilesMenu.AnchorPos)}
                    onClose={evt => { console.log(evt); this.handleMenuClose(evt, 'allFilesMenu');}}
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
                        { name: 'creators', title: 'Creators' },
                        { name: 'coverage', title: 'Coverage' },
                        { name: 'subjects', title: 'Subjects' },
                        { name: 'keywords', title: 'Keywords' },
                        { name: 'workareas', title: 'Workareas' },
                        { name: 'language', title: 'Language' },
                        { name: 'cataloger', title: 'Cataloger' },
                    ]}
                >
                    <ChippedTagsTypeProvider for={['creators', 'coverage', 'subjects', 'keywords', 'workareas', 'language', 'cataloger']} />
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
                            { columnName: 'creators', width: 420 },
                            { columnName: 'coverage', width: 120 },
                            { columnName: 'subjects', width: 420 },
                            { columnName: 'keywords', width: 420 },
                            { columnName: 'workareas', width: 420 },
                            { columnName: 'language', width: 120 },
                            { columnName: 'cataloger', width: 200 },
                        ]} />
                    <TableHeaderRow />
                    <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />
                </Grid>
                <Menu
                    id="selected-files-menu"
                    anchorPosition={this.state.selectedFilesMenu.AnchorPos}
                    anchorReference={'anchorPosition'}
                    open={Boolean(this.state.selectedFilesMenu.AnchorPos)}
                    onClose={evt => {this.handleMenuClose(evt, 'selectedFilesMenu')}}
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
