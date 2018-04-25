import axios from 'axios';
import React from 'react';

import Grid from 'material-ui/Grid';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import { CircularProgress } from 'material-ui/Progress';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';

import { APP_URLS } from './url.js';
import DownloadBuild from './download_build.js';

class ViewBuildComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            id: -1,
            name: '',
            description: '',
            currTime: '',
            currBuild: [],
            latestBuild: [],
            hidden:"hidden",
            isLoaded: false,
            noOfBuilds: 0,
            data: [],
            isLoaded : false

        };
        this.handleCheckChange = this.handleCheckChange.bind(this)
    }
    getInitialState() {
        return {checked: true}
    }

    componentDidMount() {
          //  this.loadData();
            this.timerID = setTimeout(
            () => this.loadData(),
            1000
        );

        this.intervalId = setInterval(
            () => this.loadData(),
            10000
        );

    }

   /* show(){
       console.log("show")
       this.setState({
           hidden : "",
           isLoaded : true
       });
       console.log(this.state.isLoaded);
    }*/

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    handleCheckChange(){
        console.log("clicked");
    }


    loadData() {
        console.log("called every 10 seconds")
        const currInstance = this;
        axios.get(APP_URLS.VIEW_BUILD, {
            responseType: 'json'
        }).then(function(response) {
            console.log(response.data[0])
            console.log(response.data.length)
            currInstance.setState({isLoaded:true})
            if(response.data.length == 0){
                currInstance.setState({
                    noOfBuilds : 0
                })
            }
            else if(response.data[0].task_state == 1){
                //building in process status message
                currInstance.setState({
                   isLoaded : false,
                   noOfBuilds : -1
                });
            }
            else if(response.data[0].task_state == 2){
                const latestBuild = response.data[0];
                currInstance.setState({latestBuild:latestBuild});
                //console.log(response.data[0]);
                //console.log(currInstance.state.latestBuild);
                let build_file = currInstance.state.latestBuild.build_file
                //console.log(currInstance.state.latestBuild)
                let build_split = build_file.split("/")
                let file_name = build_split[build_split.length - 1]
                let file = decodeURI(file_name)
                console.log(file);

                const res = file.replace((/ \d{4}[_]\d{2}[_]\d{2} \d{2}[_]\d{2}[_]\d{2}\.tar\.gz/i),"");
                console.log(res)

                currInstance.setState({
                   isLoaded : true,
                   noOfBuilds: 1,
                   name: res
                });
                const data={
                    name: currInstance.state.name,
                    currTime: currInstance.state.latestBuild.end_time,
                    download: currInstance.state.latestBuild.build_file
                }
                 currInstance.setState({
                   data:data
                });
                console.log(data)
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
                        <Typography variant="headline" gutterBottom>
                            {currInstance.state.name}
                        </Typography>
                    </div>
                )

                    currInstance.setState({currBuild:currBuild});
                    console.log(currInstance.state.currBuild);
            }

        }).catch(function(error) {
            console.log(error);
        });
    };

    render(){
        var elements=null
        //const { classes } = this.props;
        if(this.state.isLoaded){
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
                                <DownloadBuild build={this.state.data} />
                        }
                    </Grid>
                </Grid>
            )
        }
        else if(this.state.isLoaded && this.state.noOfBuilds == 0){
            elements = (
                <div>
                   <Typography variant="display1" gutterBottom>
                            No Builds are currently available.
                   </Typography>

                </div>
            )
        }
        else if(!this.state.isLoaded){
            elements = (
                <div>
                    Loading..

                </div>
            )
        }

        return elements;
    }
}

/*
ViewBuildComponent.propTypes = {
      classes: PropTypes.object.isRequired,
};
*/

module.exports = ViewBuildComponent