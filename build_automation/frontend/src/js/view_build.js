import axios from 'axios';
import React from 'react';

import Checkbox from 'material-ui/Checkbox';
import { CircularProgress } from 'material-ui/Progress';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
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
            completionState: true
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

        this.intervalId = setInterval(
            () => this.loadData(),
            10000
        );
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    handleCheckChange(){
    }

    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.VIEW_BUILD, {
            responseType: 'json'
        }).then(function(response) {
            currInstance.setState({isLoaded:true})
            if(response.data.length == 0){
                currInstance.setState({
                    noOfBuilds : 0
                })
            }
            else if(response.data[0].task_state == 1){
                currInstance.setState({
                   isLoaded : true,
                   noOfBuilds : -1
                });
            }
            else if(response.data[0].task_state == 2){
                if(response.data[0].completion_state == 1){
                    const latestBuild = response.data[0];
                    currInstance.setState({latestBuild:latestBuild});
                    let build_file = currInstance.state.latestBuild.build_file
                    let build_split = build_file.split("/")
                    let file_name = build_split[build_split.length - 1]
                    let file = decodeURI(file_name)
                    const res = file.replace((/ \d{4}[_]\d{2}[_]\d{2} \d{2}[_]\d{2}[_]\d{2}\.tar\.gz/i),"");

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
                }
                else if(response.data[0].completion_state == 2){
                    currInstance.setState({
                        completionState:false
                    })
            }
        }


        }).catch(function(error) {
            console.log(error)
        });
    };

    render(){
        var elements=null
        if(this.state.isLoaded && !this.state.completionState){
            elements = (
                <div>
                    Build Failed. Please try building again..
                </div>
            )
        }
        else if(this.state.isLoaded && this.state.noOfBuilds > 0){
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
        else if(this.state.isLoaded && this.state.noOfBuilds == -1){
            elements = (
                <div>
                   <Typography variant="display1" gutterBottom>
                            Build in progress..
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

module.exports = ViewBuildComponent