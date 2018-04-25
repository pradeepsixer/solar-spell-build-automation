import axios from 'axios';
import React from 'react';

import { AutoComplete } from 'material-ui';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Grid from 'material-ui/Grid';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';

import { APP_URLS } from './url.js';
import MakeBuildDirlayoutInfo from './make_build_dirlayout.js';

class MakeBuildComponent extends React.Component{
    constructor (props) {
        super(props)
        this.state = {
          dirLayouts: [],
          info: {},
          currentLayout : '',
          isLoaded : false
    };

    this.handleClick = this.handleClick.bind(this)
  //  this.handleData = this.handleData.bind(this)
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

    handleClick(layout, event){
        console.log("clicked")
        console.log(layout)
        this.setState({
            currentLayout: event.target.value,
            info:layout});
       // console.log(this.state.info);
    }

    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.DIRLAYOUT_LIST, {
            responseType: 'json'
        }).then(function(response) {
            const dirLayouts = response.data;
            currInstance.setState({
                dirLayouts:dirLayouts,
                isLoaded:true
            });
            console.log(currInstance.state.dirLayouts);
        }).catch(function(error) {
            console.log(error);
        });
    };

    render(){
        var elements=null
        if(this.state.isLoaded){
            elements=(
                <Grid container spacing={8}>
                    <Grid item xs={3} style={{paddingLeft: '20px'}}>
                        <List component="nav">
                                <ListSubheader disableSticky component="div">Library Versions</ListSubheader>
                                    <div className="container1">
                                        {
                                          <RadioGroup name="dirlayout" value={this.state.currentLayout}>
                                            {
                                                this.state.dirLayouts.map((layout,i) =>
                                                    <FormControlLabel key={i} value={layout.name} control={<Radio />} label={layout.name} onClick={evt => this.handleClick(layout, evt)} />
                                                )
                                            }

                                          </RadioGroup>
                                        }
                                    </div>
                        </List>
                    </Grid>
                    <Grid item xs={8}>
                        {
                                <MakeBuildDirlayoutInfo info={this.state.info} />
                        }
                    </Grid>
                </Grid>
            )
        }
        else{
            elements = (
                <div>Loading...</div>
            )
        }
       /* return(
            *//*<div className="container2">
                <p> Directory Layouts </p>
                <div className="container1">
                    {this.state.dirLayouts}
                </div>
            </div>*//*

        )*/
        return elements;
    }
}

module.exports = MakeBuildComponent;
