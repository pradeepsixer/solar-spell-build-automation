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

import { TableCell, TableRow } from 'material-ui/Table';

import Chip from 'material-ui/Chip';
import Menu, { MenuItem } from 'material-ui/Menu';
import Input from 'material-ui/Input';

import OpenInNew from 'material-ui-icons/OpenInNew';

import AutoCompleteFilter from './autocomplete_filter.js';

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
        this.columns = [
            {name: 'name', title: 'Name', filterType: 'textfield'},
            {name: 'description', title: 'Description', filterType: 'textfield'},
            {name: 'updated_time', title: 'Updated on', filterType: 'textfield'},
            {name: 'creators', title: 'Creators', filterType: 'autocomplete', tagKey: 'creators'},
            {name: 'coverage', title: 'Coverage', filterType: 'autocomplete', tagKey: 'coverages'},
            {name: 'subjects', title: 'Subjects', filterType: 'autocomplete', tagKey: 'subjects'},
            {name: 'keywords', title: 'Keywords', filterType: 'autocomplete', tagKey: 'keywords'},
            {name: 'workareas', title: 'Workareas', filterType: 'autocomplete', tagKey: 'workareas'},
            {name: 'language', title: 'Language', filterType: 'autocomplete', tagKey: 'languages'},
            {name: 'cataloger', title: 'Cataloger', filterType: 'autocomplete', tagKey: 'catalogers'},
        ];
        this.defaultColumnWidths=[
            {columnName: 'name', width: 230},
            {columnName: 'description', width: 250},
            {columnName: 'updated_time', width: 240},
            {columnName: 'creators', width: 420},
            {columnName: 'coverage', width: 420},
            {columnName: 'subjects', width: 420},
            {columnName: 'keywords', width: 420},
            {columnName: 'workareas', width: 420},
            {columnName: 'language', width: 240},
            {columnName: 'cataloger', width: 240},
        ];
        this.getFilterCellComponent = this.getFilterCellComponent.bind(this);
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

    getFilterCellComponent(props) {
        const {filter, onFilter, column, filteringEnabled} = props;
        if (column.filterType === "autocomplete") {
            const { tagKey } = column;
            return (
                <TableCell style={{paddingLeft: '10px', paddingRight: '5px'}}>
                    <AutoCompleteFilter filter={filter} suggestions={this.props.tags[tagKey]} onFilter={onFilter} />
                </TableCell>
            );
        }
        return (
            <TableCell style={{paddingLeft: '10px', paddingRight: '5px'}}>
                <Input
                    fullWidth
                    value={filter ? filter.value : ''}
                    placeholder='Filter...'
                    onChange={evt => onFilter(evt.target.value ? { value: evt.target.value } : null)}
                />
            </TableCell>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Typography gutterBottom variant="headline" component="h2">
                    Select individual files
                </Typography>
                <Grid rows={this.props.allFiles} columns={this.columns}>
                    <ChippedTagsTypeProvider for={['creators', 'coverage', 'subjects', 'keywords', 'workareas', 'language', 'cataloger']} />
                    <LinkTypeProvider for={['content_file']} />
                    <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'content_file', filteringEnabled: false}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'allFilesMenu')}} />
                    <TableColumnResizing defaultColumnWidths={this.defaultColumnWidths} />
                    <TableHeaderRow />
                    <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow cellComponent={this.getFilterCellComponent}/>
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
                <Grid rows={this.state.selectedFiles} columns={this.columns}>
                    <ChippedTagsTypeProvider for={['creators', 'coverage', 'subjects', 'keywords', 'workareas', 'language', 'cataloger']} />
                    <LinkTypeProvider for={['content_file']} />
                    <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'content_file', filteringEnabled: false}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'selectedFilesMenu')}} />
                    <TableColumnResizing defaultColumnWidths={this.defaultColumnWidths} />
                    <TableHeaderRow />
                    <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow cellComponent={this.getFilterCellComponent}/>
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
