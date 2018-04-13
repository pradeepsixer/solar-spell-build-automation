import axios from 'axios';
import React from 'react';
import TagCreation from './addTag'

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
import {APP_URLS} from "./url";


class TagManagementComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state={
          selectedTagsMenu: {
            selectedTag: null,
            AnchorPos: null
          },
            currentView: 'manage',
            currentpanelState: 'Coverages',
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
        this.setCurrentView=this.setCurrentView.bind(this);
        this.handleFilesRightClick = this.handleTagsRightClick.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
        
    }

    

    handleChange(panel) {
        const thisInstance = this
        return function(event, expanded) {
            thisInstance.setState({
              expanded: expanded ? panel : false,
              
            });
        }
    }

    setCurrentView(viewName, selectedPanel, listUrl, detailUrl){
      this.setState({
        currentView: viewName,
        currentpanelState: selectedPanel,
        listUrl: listUrl,
        detailUrl: detailUrl
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
    });}
   
    tableRowComponent(obj, menuName)  {
      const {row, children} = obj;
      return(<TableRow onContextMenu={evt => this.handleTagsRightClick(evt, row, menuName)}>{children}</TableRow>);
  }

  handleTagsRightClick(evt, row, menuName) {
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
            selectedTag: null,
            AnchorPos: null
        }
    });
}

    render() {
        const { classes } = this.props;
        const { expanded } = this.state;
        const { coverageRows, coverageColumns } = this.state;  
        const { subjectRows, subjectColumns } = this.state;
        const { workareaRows, workareaColumns } = this.state;
        const { languageRows, languageColumns } = this.state;
        const { catalogerRows, catalogerColumns } = this.state;
        

    return(
      <Grid container spacing={0}>
      <Grid item xs={4}>
           {/* <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('manage')}}>
            Manage MetaData
            </Button> */}
          
          </Grid>
          { this.state.currentView=='manage' && (
        
        <Grid container spacing={0}>
        <Grid item xs={12}>
        <ExpansionPanel expanded={expanded === 'panel2'} onChange={this.handleChange('panel2')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Coverages</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Grid container>
          <Grid item>
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'Coverages', APP_URLS.COVERAGES_LIST, APP_URLS.COVERAGES_DETAIL)}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={coverageRows}
          columns={coverageColumns}
          >
          <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'name', filteringEnabled: true}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'selectedTagsMenu')}} />
          <TableHeaderRow />
          <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />
          
          </DataGrid>
          </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === 'panel3'} onChange={this.handleChange('panel3')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Subjects</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Grid container>
          <Grid item>
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'Subjects', APP_URLS.SUBJECTS_LIST,APP_URLS.SUBJECTS_DETAIL)}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={subjectRows}
          columns={subjectColumns}
          >
          <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'name', filteringEnabled: true}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'selectedTagsMenu')}} />
          <TableHeaderRow />
          <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />
          </DataGrid>
          </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === 'panel4'} onChange={this.handleChange('panel4')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Work Areas</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Grid container>
          <Grid item>
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'Work Areas', APP_URLS.WORKAREAS_LIST, APP_URLS.WORKAREAS_DETAIL)}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={workareaRows}
          columns={workareaColumns}
          >
          <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'name', filteringEnabled: true}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'selectedTagsMenu')}} />
          <TableHeaderRow />
          <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />
          </DataGrid>
          </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === 'panel5'} onChange={this.handleChange('panel5')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Languages</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Grid container>
          <Grid item>
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'Languages', APP_URLS.LANGUAGES_LIST, APP_URLS.LANGUAGES_DETAIL)}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={languageRows}
          columns={languageColumns}
          >
          <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'name', filteringEnabled: true}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'selectedTagsMenu')}} />
          <TableHeaderRow /> 
          <TableColumnVisibility/>
                    <Toolbar />
                    <ColumnChooser />
                    <TableFilterRow />
                    <PagingPanel pageSizes={[5, 10, 20]} />         
          </DataGrid>
          </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>        
        <ExpansionPanel expanded={expanded === 'panel7'} onChange={this.handleChange('panel7')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Catalogers</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container>
          <Grid item><Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'Catalogers', APP_URLS.CATALOGERS_LIST, APP_URLS.CATALOGERS_DETAIL)}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={catalogerRows}
          columns={catalogerColumns}
          >
          <FilteringState defaultFilters={[]} columnExtensions={[{columnName: 'name', filteringEnabled: true}]} />
                    <IntegratedFiltering />
                    <PagingState defaultCurrentPage={0} defaultPageSize={10} />
                    <IntegratedPaging />
                    <Table rowComponent={obj => {return this.tableRowComponent(obj, 'selectedTagsMenu')}} />
          <TableHeaderRow />
          <TableColumnVisibility/>
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
                    onClose={evt => {this.handleMenuClose(evt, 'selectedTagsMenu')}}
                >
                    <MenuItem
                        onClick={evt => {
                            this.handleMenuClose(evt, 'selectedFilesMenu');
                        }}
                    > 
                    Edit
                    </MenuItem>
                    <MenuItem
                        onClick={evt => {
                            this.handleMenuClose(evt, 'selectedFilesMenu');
                        }}
                    >
                      Delete
                    </MenuItem>
                </Menu>
            </Grid>
            
        </Grid>
    )}
    {this.state.currentView=='addTag' && <TagCreation title={this.state.currentpanelState} onCancel={() => this.setCurrentView('manage') } listUrl={this.state.listUrl} detailUrl={this.state.detailUrl}/> }

    </Grid>
    )
           
        
        
    }
}

module.exports = TagManagementComponent;