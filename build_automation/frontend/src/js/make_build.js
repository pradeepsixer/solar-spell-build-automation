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
          currentLayout : {},
          value : ''
    };

    this.handleClick = this.handleClick.bind(this)
    this.handleData = this.handleData.bind(this)
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
            value: event.target.value,
            info:layout});
       // console.log(this.state.info);
    }

    handleData(currentLayout){
    console.log(currentLayout)
        this.setState({
            currentLayout: currentLayout
        });
        this.props.handlerFromParent(currentLayout)
    }

    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.DIRLAYOUT_LIST, {
            responseType: 'json'
        }).then(function(response) {
            const dirLayouts = response.data;
            currInstance.setState({dirLayouts:dirLayouts});
            console.log(currInstance.state.dirLayouts);

            //const dirLayouts = response.data;
            //console.log(dirLayouts)
        }).catch(function(error) {
            console.log(error);
        });
    };

    render(){
        var elements=null
        elements=(
            <Grid container spacing={8}>
                <Grid item xs={3} style={{paddingLeft: '20px'}}>
                    <List component="nav">
                            <ListSubheader disableSticky component="div">Directory Layouts</ListSubheader>
                                <div className="container1">
                                    {  this.state.dirLayouts.map((layout,i) =>
                                        <div key={i}>
                                             <RadioGroup ref="dirlayout" name="dirlayout" value={this.state.value} onChange={event => this.handleClick(layout, event)}>
                                                    <FormControlLabel value={layout.name} control={<Radio />} label={layout.name} />
                                             </RadioGroup>
                                        </div>)
                                    }




                                </div>
                    </List>
                </Grid>
                <Grid item xs={8}>
                    <div style={{marginTop: '20px'}}> </div>
                    {
                            <MakeBuildDirlayoutInfo handlerFromParent={this.handleData} info={this.state.info} />
                    }
                </Grid>
            </Grid>
        )
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
