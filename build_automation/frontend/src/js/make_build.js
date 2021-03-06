import axios from 'axios';
import React from 'react';

import { FormLabel, FormControl, FormControlLabel, FormHelperText } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

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
        this.setState({
            currentLayout: event.target.value,
            info:layout});
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
        }).catch(function(error) {
            console.error(error)
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
        return elements;
    }
}

export default MakeBuildComponent;
