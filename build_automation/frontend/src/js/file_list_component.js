import React from 'react';
import Typography from 'material-ui/Typography';
import Chip from 'material-ui/Chip';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import axios from 'axios';
import { APP_URLS, get_url } from './url.js';

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

var __tagIdsTagsMap = {};

function ChippedTagsFormatter(input) {
    const {row, column, value} = input;
    const allChips = [];
    if (typeof(value)=='number') {
        allChips.push(<Chip key={row.id + '_' + column['name'] + '_' + value} label={__tagIdsTagsMap[column['name']
        +'s'][value]['name']} />);
    }
    else {
        value.forEach(eachTagId => {
            allChips.push(<Chip key={row.id + '_' + column['name'] + '_' + eachTagId}
                                label={__tagIdsTagsMap[column['name']][eachTagId]['name']}/>);
        });
    }
    return allChips;
}

function ChippedTagsTypeProvider(props) {
    return (<DataTypeProvider formatterComponent={ChippedTagsFormatter} {...props} />);
}

class FileListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            allFilesMenu: {
                selectedFile: null,
                AnchorPos: null
            },
            allFiles: props.allFiles,
            confirmDelete: false,
            selectedFile: null
        };
        console.log(props);
        __tagIdsTagsMap = props.tagIdsTagsMap;
        this.deleteCallback = props.onDelete;
        this.editCallback = props.onEdit;
        this.closeConfirmDialog = this.closeConfirmDialog.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.handleFilesRightClick = this.handleFilesRightClick.bind(this);
    }

    componentWillReceiveProps(props) {
        __tagIdsTagsMap = props.tagIdsTagsMap;
        this.setState({allFiles: props.allFiles})
    }

    handleFilesRightClick(evt, row, menuName) {
        console.log(menuName, row, 'This is the value!');
        this.setState({
            [menuName]: {
                selectedFile: row,
                AnchorPos: {top:evt.clientY, left:evt.clientX}
            },
            selectedFile: row
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

    tableRowComponent(obj, menuName)  {
        const {row, children} = obj;
        return(<tr onContextMenu={evt => this.handleFilesRightClick(evt, row, menuName)}>{children}</tr>);
    }

    deleteFile(file) {
        const targetUrl = get_url(APP_URLS.CONTENT_DETAIL, {id: file.id});
        const currentInstance = this;
        axios.delete(targetUrl).then(function (response) {
            if (currentInstance.deleteCallback){
                currentInstance.deleteCallback(file);
            }
        }).catch(function (error) {
            console.error("Error in deleting the file ", error);
        });
    }

    confirmDeleteContent() {
        this.setState({
            confirmDelete: true
        })
    }

    closeConfirmDialog() {
        this.setState({confirmDelete: false})
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
                            // this.handleMenuClose(evt, 'allFilesMenu');
                            console.log('What the heck!');
                            this.editCallback(this.state.selectedFile);
                        }}
                    >
                        Edit this file
                    </MenuItem>
                    <MenuItem
                        onClick={evt => {
                            this.handleMenuClose(evt, 'allFilesMenu');
                            window.open(this.state.allFilesMenu.selectedFile.content_file, '_blank');
                        }}
                    >
                        View this file
                    </MenuItem>
                    <MenuItem
                        onClick={evt => {
                            this.handleMenuClose(evt, 'allFilesMenu');
                            this.confirmDeleteContent();
                        }}
                    >
                        Delete this file
                    </MenuItem>
                </Menu>
                <Dialog
                    open={this.state.confirmDelete}
                    onClose={this.closeConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete this file {this.state.name}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeConfirmDialog} color="primary">
                            No
                        </Button>
                        <Button onClick={evt => {this.closeConfirmDialog(); this.deleteFile(this.state.selectedFile);}} color="primary" autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}
module.exports = FileListComponent;
