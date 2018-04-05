import React from 'react';

import Grid from 'material-ui/Grid';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup, FormControlLabel } from 'material-ui/Form';

import DownloadBuild from './download_build.js';

class ViewBuildComponent extends React.Component{
    constructor(props){
        super(props)
        console.log(props);
        this.state = {
            id: props.built.id,
            name: props.built.name,
            description: props.built.description,
            currTime: props.built.currTime,
            currBuild: []
        };
        this.handleCheckChange = this.handleCheckChange.bind(this)
    }
    getInitialState() {
        return {checked: true}
    }

    componentDidMount() {
        this.timerID = setTimeout(
            () => this.loadData(),
            1000
        );
    }

    componentWillUnmount() {
        clearTimeout(this.timerID);
    }

    handleCheckChange(){
        console.log("clicked");
    }

    loadData() {
        const currInstance = this;
        const styles = {
                          block: {
                            maxWidth: 250,
                          },
                          checkbox: {
                            marginBottom: 16,
                          },
                        };
        const currBuild = (
            <div>
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked={true}
                      onChange={currInstance.handleCheckChange()}
                      color="primary"
                    />
                  }
                  label={currInstance.state.name}
                />
            </div>
        )

            currInstance.setState({currBuild:currBuild});
            console.log(currInstance.state.currBuild);
    };


    render(){
        var elements=null
        elements=(
            <Grid container spacing={8}>
                <Grid item xs={3} style={{paddingLeft: '20px'}}>
                    <List component="nav">
                            <ListSubheader disableSticky component="div">Current Build</ListSubheader>
                                <div className="container1">
                                    {this.state.currBuild}
                                </div>
                    </List>
                </Grid>
                <Grid item xs={8}>
                    <div style={{marginTop: '20px'}}> </div>
                    {
                            <DownloadBuild build={this.props.built} />
                    }
                </Grid>
            </Grid>
        )
        return elements;
    }
}

module.exports = ViewBuildComponent