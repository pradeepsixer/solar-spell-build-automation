import axios from 'axios';
import React from 'react';
import TagCreation from './addTag'

import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import OpenInNew from 'material-ui-icons/OpenInNew';


import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import ExpansionPanel, {
    ExpansionPanelDetails,
    ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';

import {
    DataTypeProvider,
    FilteringState,
    IntegratedFiltering,
    IntegratedPaging,
    PagingState,
} from '@devexpress/dx-react-grid';
import {
    ColumnChooser,
    Grid as DataGrid,
    Table,
    TableHeaderRow,
    TableFilterRow,
    TableColumnResizing,
    TableColumnVisibility,
    Toolbar,
    PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

import { TableRow } from 'material-ui/Table';
import Menu, { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import { APP_URLS, get_url } from "./url";
import cloneDeep from 'lodash/fp/cloneDeep';
import { TAG_SAVE_TYPE } from './constants.js';

class TagManagementComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTag: null,
            currentPanel: null,
            selectedTagsMenu: {
                selectedTag: null,
                AnchorPos: null
            },
            confirmDelete: false,
            message: null,
            messageType: 'info',
            currentView: 'manage',
            currentTitle: 'Coverages',
            expanded: null,
            listUrl: null,
            detailUrl: null,
            coverageColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' }
            ],
            coverageRows: [],
            subjectColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
            ],
            subjectRows: [],
            workareaColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
            ],
            workareaRows: [],
            languageColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
            ],
            languageRows: [],
            catalogerColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
            ],
            catalogerRows: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.setCurrentView = this.setCurrentView.bind(this);
        this.setUrls = this.setUrls.bind(this);
        this.handleFilesRightClick = this.handleTagsRightClick.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
        this.deleteTag = this.deleteTag.bind(this);
        this.handleAccordionClick = this.handleAccordionClick.bind(this);
        this.saveTagCallback = this.saveTagCallback.bind(this);
        this.handleTagEdit = this.handleTagEdit.bind(this);
        this.addNewTag = this.addNewTag.bind(this);
        // this.confirmDeleteTag = this.confirmDeleteTag.bind(this);
        // this.getErrorClass = this.getErrorClass.bind(this);
        // this.closeConfirmDialog = this.closeConfirmDialog.bind(this);
    }

    // getErrorClass() {
    //     return this.state.messageType === "error" ? { backgroundColor: '#B71C1C', fontWeight: 'normal' } : {};
    // }
    // confirmDeleteTag() {
    //     this.setState({
    //         confirmDelete: true
    //     })
    // }

    // closeConfirmDialog() {
    //     this.setState({ confirmDelete: false })
    // }

    handleChange(panel) {
        const thisInstance = this
        return function (event, expanded) {
            thisInstance.setState({
                expanded: expanded ? panel : false,

            });
        }
    }

    handleAccordionClick(panel) {
        this.setState({
            currentPanel: panel
        });
    }

    setUrls(listUrl, detailUrl) {
        this.setState({
            listUrl: listUrl,
            detailUrl: detailUrl
        })
    }

    setCurrentView(viewName, selectedPanel) {
        this.setState({
            currentView: viewName,
            currentTitle: selectedPanel
        })
    }

    addNewTag(selectedPanel) {
        this.setState({
            currentView: 'addTag',
            currentTitle: selectedPanel,
            selectedTag: {
                id: -1,
                name: '',
                description: ''
            },

        })
    }
    componentDidMount() {
        this.loadData()
    }

    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.ALLTAGS_LIST, {
            responseType: 'json'
        }).then(function (resp) {
            const response = resp.data;
            currInstance.setState({
                subjectRows: response['subjects'],
                coverageRows: response['coverages'],
                workareaRows: response['workareas'],
                languageRows: response['languages'],
                catalogerRows: response['catalogers'],
            })
        }).catch(function (error) {
            console.log(error);
            // TODO : Show the error message.
        });
    }

    tableRowComponent(obj, menuName) {
        const { row, children } = obj;
        return (<TableRow onContextMenu={evt => this.handleTagsRightClick(evt, row, menuName)}>{children}</TableRow>);
    }

    handleTagsRightClick(evt, row, menuName) {
        this.setState({
            [menuName]: {
                selectedTag: row,
                AnchorPos: { top: evt.clientY, left: evt.clientX }
            }
        });
        evt.preventDefault();
    }


    deleteTagCallback(deletedItemId) {
        var tagDataKey = this.state.currentPanel + "Rows";
        this.setState((prevState, props) => {
            const newState = {
                [tagDataKey]: prevState[tagDataKey]
            }
            for (var i = 0; i < newState[tagDataKey].length; i++) {
                if (newState[tagDataKey][i].id == deletedItemId) {
                    newState[tagDataKey].splice(i, 1);
                    break;
                }
            }

            return newState;
        });
    }

    deleteTag() {
        const selectedTagId = this.state.selectedTagsMenu.selectedTag.id;
        const targetUrl = get_url(this.state.detailUrl, { id: selectedTagId });
        const currentInstance = this;
        axios.delete(targetUrl, {
            responseType: 'json'
        }).then(function (response) {
            currentInstance.deleteTagCallback(selectedTagId);
        }).catch(function (error) {
            console.error("Error in deleting the meta data", error);
        })
    }

    handleMenuClose(evt, menuName) {
        this.setState({
            [menuName]: {
                selectedTag: null,
                AnchorPos: null
            }
        });
    }

    saveTagCallback(savedTag, saveType) {
        var tagDataKey = this.state.currentPanel + "Rows";

        this.setState((prevState, props) => {
            const newState = {
                [tagDataKey]: prevState[tagDataKey],
                currentView: 'manage'
            };

            if (saveType == TAG_SAVE_TYPE.CREATE) {
                const newTag = {
                    id: savedTag.id,
                    name: savedTag.name,
                    description: savedTag.description
                };
                newState[tagDataKey].push(newTag);

            } else if (saveType == TAG_SAVE_TYPE.UPDATE) {
                newState[tagDataKey].forEach(eachTag => {
                    if (eachTag.id == savedTag.id) {
                        eachTag.name = savedTag.name;
                        eachTag.description = savedTag.description;
                    }
                });
            }

            return newState;
        });

    }

    handleTagEdit() {
        const selectedTag = this.state.selectedTagsMenu.selectedTag;
        const currentInstance = this;
        this.setState({
            currentView: 'addTag',
            selectedTag: {
                id: selectedTag.id,
                name: selectedTag.name,
                description: selectedTag.description
            }
        })
    }

    render() {
        const { classes } = this.props;
        const { expanded } = this.state;
        const { coverageRows, coverageColumns } = this.state;
        const { subjectRows, subjectColumns } = this.state;
        const { workareaRows, workareaColumns } = this.state;
        const { languageRows, languageColumns } = this.state;
        const { catalogerRows, catalogerColumns } = this.state;


        return (
            <Grid container spacing={0}>
                <Grid item xs={4}>
                    {/* <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('manage')}}>
            Manage MetaData
            </Button> */}

                </Grid>
                {this.state.currentView == 'manage' && (

                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <ExpansionPanel expanded={expanded === 'coverage'} onChange={this.handleChange('coverage')} onClick={e => { this.handleAccordionClick('coverage') }}>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} onClick={e => { this.setUrls(APP_URLS.COVERAGES_LIST, APP_URLS.COVERAGES_DETAIL) }}>
                                    <Typography>Coverages</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Grid container>
                                        <Grid item>
                                            <Button variant="raised" color="primary" onClick={e => { this.addNewTag('Coverages') }}>
                                                Add New
            </Button>
                                        </Grid>
                                        <DataGrid
                                            rows={coverageRows}
                                            columns={coverageColumns}
                                        >
                                            <FilteringState defaultFilters={[]} columnExtensions={[{ columnName: 'name', filteringEnabled: true }]} />
                                            <IntegratedFiltering />
                                            <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                                            <IntegratedPaging />
                                            <Table rowComponent={obj => { return this.tableRowComponent(obj, 'selectedTagsMenu') }} />
                                            <TableHeaderRow />
                                            <TableColumnVisibility />
                                            <Toolbar />
                                            <ColumnChooser />
                                            <TableFilterRow />
                                            <PagingPanel pageSizes={[5, 10, 20]} />

                                        </DataGrid>
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <ExpansionPanel expanded={expanded === 'subject'} onChange={this.handleChange('subject')} onClick={e => { this.handleAccordionClick('subject') }}>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} onClick={e => { this.setUrls(APP_URLS.SUBJECTS_LIST, APP_URLS.SUBJECTS_DETAIL) }}>
                                    <Typography>Subjects</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Grid container>
                                        <Grid item>
                                            <Button variant="raised" color="primary" onClick={e => { this.addNewTag('Subjects') }}>
                                                Add New
            </Button>
                                        </Grid>
                                        <DataGrid
                                            rows={subjectRows}
                                            columns={subjectColumns}
                                        >
                                            <FilteringState defaultFilters={[]} columnExtensions={[{ columnName: 'name', filteringEnabled: true }]} />
                                            <IntegratedFiltering />
                                            <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                                            <IntegratedPaging />
                                            <Table rowComponent={obj => { return this.tableRowComponent(obj, 'selectedTagsMenu') }} />
                                            <TableHeaderRow />
                                            <TableColumnVisibility />
                                            <Toolbar />
                                            <ColumnChooser />
                                            <TableFilterRow />
                                            <PagingPanel pageSizes={[5, 10, 20]} />
                                        </DataGrid>
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <ExpansionPanel expanded={expanded === 'workarea'} onChange={this.handleChange('workarea')} onClick={e => { this.handleAccordionClick('workarea') }}>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} onClick={e => { this.setUrls(APP_URLS.WORKAREAS_LIST, APP_URLS.WORKAREAS_DETAIL) }}>
                                    <Typography>Work Areas</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Grid container>
                                        <Grid item>
                                            <Button variant="raised" color="primary" onClick={e => { this.addNewTag('Work Areas') }}>
                                                Add New
            </Button>
                                        </Grid>
                                        <DataGrid
                                            rows={workareaRows}
                                            columns={workareaColumns}
                                        >
                                            <FilteringState defaultFilters={[]} columnExtensions={[{ columnName: 'name', filteringEnabled: true }]} />
                                            <IntegratedFiltering />
                                            <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                                            <IntegratedPaging />
                                            <Table rowComponent={obj => { return this.tableRowComponent(obj, 'selectedTagsMenu') }} />
                                            <TableHeaderRow />
                                            <TableColumnVisibility />
                                            <Toolbar />
                                            <ColumnChooser />
                                            <TableFilterRow />
                                            <PagingPanel pageSizes={[5, 10, 20]} />
                                        </DataGrid>
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <ExpansionPanel expanded={expanded === 'language'} onChange={this.handleChange('language')} onClick={e => { this.handleAccordionClick('language') }}>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} onClick={e => { this.setUrls(APP_URLS.LANGUAGES_LIST, APP_URLS.LANGUAGES_DETAIL) }}>
                                    <Typography>Languages</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Grid container>
                                        <Grid item>
                                            <Button variant="raised" color="primary" onClick={e => { this.addNewTag('Languages') }}>
                                                Add New
            </Button>
                                        </Grid>
                                        <DataGrid
                                            rows={languageRows}
                                            columns={languageColumns}
                                        >
                                            <FilteringState defaultFilters={[]} columnExtensions={[{ columnName: 'name', filteringEnabled: true }]} />
                                            <IntegratedFiltering />
                                            <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                                            <IntegratedPaging />
                                            <Table rowComponent={obj => { return this.tableRowComponent(obj, 'selectedTagsMenu') }} />
                                            <TableHeaderRow />
                                            <TableColumnVisibility />
                                            <Toolbar />
                                            <ColumnChooser />
                                            <TableFilterRow />
                                            <PagingPanel pageSizes={[5, 10, 20]} />
                                        </DataGrid>
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <ExpansionPanel expanded={expanded === 'cataloger'} onChange={this.handleChange('cataloger')} onClick={e => { this.handleAccordionClick('cataloger') }}>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} onClick={e => { this.setUrls(APP_URLS.CATALOGERS_LIST, APP_URLS.CATALOGERS_DETAIL) }}>
                                    <Typography>Catalogers</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Grid container>
                                        <Grid item><Button variant="raised" color="primary" onClick={e => { this.addNewTag('Catalogers') }}>
                                            Add New
            </Button>
                                        </Grid>
                                        <DataGrid
                                            rows={catalogerRows}
                                            columns={catalogerColumns}
                                        >
                                            <FilteringState defaultFilters={[]} columnExtensions={[{ columnName: 'name', filteringEnabled: true }]} />
                                            <IntegratedFiltering />
                                            <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                                            <IntegratedPaging />
                                            <Table rowComponent={obj => { return this.tableRowComponent(obj, 'selectedTagsMenu') }} />
                                            <TableHeaderRow />
                                            <TableColumnVisibility />
                                            <Toolbar />
                                            <ColumnChooser />
                                            <TableFilterRow />
                                            <PagingPanel pageSizes={[5, 10, 20]} />
                                        </DataGrid>
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <Menu
                                id="selected-tags-menu"
                                anchorPosition={this.state.selectedTagsMenu.AnchorPos}
                                anchorReference={'anchorPosition'}
                                open={Boolean(this.state.selectedTagsMenu.AnchorPos)}
                                onClose={evt => { this.handleMenuClose(evt, 'selectedTagsMenu') }}
                            >
                                <MenuItem
                                    onClick={currentView => {
                                        this.handleTagEdit();
                                    }}

                                >
                                    Edit
                    </MenuItem>
                                <MenuItem
                                    onClick={evt => {
                                        this.deleteTag();
                                        this.handleMenuClose(evt, 'selectedTagsMenu');
                                    }}
                                >
                                    Delete
                    </MenuItem>
                            </Menu>
                        </Grid>
                        {/* <Dialog
                            open={Boolean(this.state.confirmDeleteTag)}
                            onClose={this.closeConfirmDialog}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">{"Confirm Delete?"}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    Are you sure you want to delete this meta data ?{this.state.name}?
                        </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.closeConfirmDialog} color="primary">
                                    No
                        </Button>
                                <Button onClick={evt => { this.closeConfirmDialog(); this.deleteTag(); }} color="primary" autoFocus>
                                    Yes
                        </Button>
                            </DialogActions>
                        </Dialog>
                        <Snackbar
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            open={Boolean(this.state.message)}
                            onClose={this.handleCloseSnackbar}
                            message={<span>{this.state.message}</span>}
                            SnackbarContentProps={{
                                "style": this.getErrorClass()
                            }}
                        /> */}

                    </Grid>


                )}
                {
                    this.state.currentView == 'addTag' &&
                    <TagCreation tag={this.state.selectedTag} title={this.state.currentTitle} onSave={this.saveTagCallback} onEdit={this.selectedTagId}
                        onCancel={() => this.setCurrentView('manage')} listUrl={this.state.listUrl}
                        detailUrl={this.state.detailUrl} />
                }

            </Grid>
        )



    }
}

module.exports = TagManagementComponent;