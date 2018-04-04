import axios from 'axios';
import React from 'react';
import { AutoComplete } from 'material-ui';
import {RadioGroup, Radio} from 'react-radio-group'
import Grid from 'material-ui/Grid';

import { APP_URLS } from './url.js';
import MakeBuildDirlayoutInfo from './make_build_dirlayout.js';

class MakeBuildComponent extends React.Component{
    constructor (props) {
    super(props)
    this.state = {
      dirLayouts: [],
      info: {},
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
        console.log("clicked")
        console.log(layout)
        this.setState({info:layout});
        console.log(this.state.info);
    }

    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.DIRLAYOUT_LIST, {
            responseType: 'json'
        }).then(function(response) {
            const dirLayouts = response.data.map((layout, i) => {
                return(
                    <div key={i}>
                        <RadioGroup name="dirlayouts" selectedValue={currInstance.state.selectedValue}
                            onChange={event => currInstance.handleClick(layout, event)}>
                            <Radio value={layout.id} />{layout.name}
                        </RadioGroup>
                    </div>
                    /*<div key={i}>
                        <li onClick={event => currInstance.handleClick(layout, event)}>
                            {layout.name}
                        </li>
                    </div>*/
                )
            }, this);

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
                    <div className="container1">
                        {this.state.dirLayouts}
                    </div>
                </Grid>
                <Grid item xs={8}>
                    <div style={{marginTop: '20px'}}> </div>
                    {
                        <MakeBuildDirlayoutInfo info={this.state.info} />
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
