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
    // State or Local Processing Plugins
  } from '@devexpress/dx-react-grid';
import {
    Grid as DataGrid,
    Table,
    TableHeaderRow
  } from '@devexpress/dx-react-grid-material-ui';

import Typography from 'material-ui/Typography';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import {APP_URLS} from "./url";


class TagManagementComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            currentView: 'manage',
            currentpanelState: 'creators',
            expanded: null,
            creatorColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
              ],
              creatorRows: [],
              coverageColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
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
              keywordColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
              ],
              keywordRows: [],
              catalogerColumns: [
                { name: 'name', title: 'Name' },
                { name: 'description', title: 'Description' },
              ],
              catalogerRows: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.setCurrentView=this.setCurrentView.bind(this);
    }

    

    handleChange(panel) {
        const thisInstance = this
        return function(event, expanded) {
            thisInstance.setState({
              expanded: expanded ? panel : false,
              
            });
        }
    }

    setCurrentView(viewName, selectedPanel){
      this.setState({
        currentView: viewName,
        currentpanelState: selectedPanel})
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
            creatorRows: response['creators'],
            coverageRows: response['coverages'],
            workareaRows: response['workareas'],
            keywordRows: response['keywords'],
            languageRows: response['languages'],
            catalogerRows: response['catalogers'],
        })
    }).catch(function (error) {
        console.log(error);
        // TODO : Show the error message.
    });}
   
    render() {
        const { classes } = this.props;
        const { expanded } = this.state;
        const { creatorRows, creatorColumns } = this.state; 
        const { coverageRows, coverageColumns } = this.state;  
        const { subjectRows, subjectColumns } = this.state;
        const { workareaRows, workareaColumns } = this.state;
        const { languageRows, languageColumns } = this.state;
        const { keywordRows, keywordColumns } = this.state;
        const { catalogerRows, catalogerColumns } = this.state;
        

    return(
      <Grid container spacing={0}>
      <Grid item xs={4}>
           <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('manage')}}>
            Manage MetaData
            </Button>
          
          </Grid>
          { this.state.currentView=='manage' && (
        
        <Grid container spacing={0}>
        <Grid item xs={12}>
        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleChange('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Creators</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Grid container>
          <Grid item>
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'creators')}}>
            Add New
            </Button>
            </Grid>
            
            
          <DataGrid
          rows={creatorRows}
          columns={creatorColumns}
          >
          <Table />
          <TableHeaderRow />
          
          </DataGrid>
          </Grid>
          
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === 'panel2'} onChange={this.handleChange('panel2')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Coverages</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Grid container>
          <Grid item>
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'coverages')}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={coverageRows}
          columns={coverageColumns}
          >
          <Table />
          <TableHeaderRow />
          
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
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'subjects')}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={subjectRows}
          columns={subjectColumns}
          >
          <Table />
          <TableHeaderRow />
          
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
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'work areas')}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={workareaRows}
          columns={workareaColumns}
          >
          <Table />
          <TableHeaderRow />
          
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
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'languages')}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={languageRows}
          columns={languageColumns}
          >
          <Table />
          <TableHeaderRow />
          
          </DataGrid>
          </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === 'panel6'} onChange={this.handleChange('panel6')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography>Keywords</Typography>
            </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Grid container>
          <Grid item>
          <Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'keywords')}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={keywordRows}
          columns={keywordColumns}
          >
          <Table />
          <TableHeaderRow />
          
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
          <Grid item><Button variant="raised" color="primary" onClick={e => {this.setCurrentView('addTag', 'catalogers')}}>
            Add New
            </Button>
            </Grid>
          <DataGrid
          rows={catalogerRows}
          columns={catalogerColumns}
          >
          <Table />
          <TableHeaderRow />
          
          </DataGrid>
          </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>  
            </Grid>
            
        </Grid>
    )}
    {this.state.currentView=='addTag' && <TagCreation title={this.state.currentpanelState} />}
    </Grid>
    );
           
        
        
    }
}

module.exports = TagManagementComponent;