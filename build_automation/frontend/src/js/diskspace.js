import React from 'react';
import {APP_URLS} from "./url";
import axios from 'axios';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import { FormControl, FormControlLabel } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Chart from 'chart.js';
import {Doughnut} from 'react-chartjs-2';


const styles = {
    root: {
    flexGrow: 1
    },
    barColorPrimary: {
        backgroundColor: "#46BFBD"
    },
    bar: {
        background: "#F7464A"
    },
    paper: {
      padding: 8,
      textAlign: 'center',
      fontSize: 20,
      fontFamily: 'Verdana',
      fontWeight: 'bold',
    }
};

class DiskSpace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: "",
            completed: 0,
            multiplier: 1048576,
            name: "",
            value: '0',
        };
        this.unit = " MB"
        this.handleChange = this.handleChange.bind(this);
        this.changeView = this.changeView.bind(this);
    }

    handleChange(event) {
        this.setState({ multiplier: event.target.value, [event.target.name]: event.target.value });
        if(event.target.value == 1048576) {
            this.unit = " MB"
        }
        if(event.target.value == 1073741824) {
        this.unit = " GB";
        }
    }

    changeView(event) {
        this.setState({value: event.target.value});

    }

    componentDidMount() {
        this.loadData();
    }
    loadData() {
        const that = this;
        axios
            .get(APP_URLS.DISKSPACE, {responseType: 'json'})
            .then((response) => {
                this.used = response.data.total_space - response.data.available_space
                this.avail = response.data.available_space
                this.setState({completed: 100*(response.data.total_space-response.data.available_space)/response.data.total_space});
            })
            .catch((error) => {
                console.error(error);
                // TODO : Show the error message.
            });
    }

    render() {
        const { classes } = this.props;
        var options = {
            percentageInnerCutout: 50,
            responsive: true,
            animationEasing : 'easeOutBack',
        }

        return (
            <div className={classes.root}>
                <div style={{padding:20}}>
                    <Grid container spacing={40}>
                    <Grid item xs={2.5}>
                        <Paper className={classes.paper}>Disk Usage Statistics</Paper>
                        <Paper className={classes.paper}>
                        <Select
                        value={this.state.multiplier}
                        onChange={this.handleChange}
                        >
                            <MenuItem value={1048576}>In MB</MenuItem>
                            <MenuItem value={1073741824}>In GB</MenuItem>
                        </Select>
                        </Paper>
                    </Grid>
                    <Grid item xs={7}>
                    </Grid>
                    <Grid item xs={2.5}>
                        <div>
                        <FormControl>
                        <RadioGroup
                            value= {this.state.value}
                            onChange= {this.changeView}
                            style={{ display: 'inline-block' }}
                        >
                        <FormControlLabel value="0" control={<Radio/>} label="Linear View"/>
                        <FormControlLabel value="1" control={<Radio/>} label="Doughnut View"/>
                        </RadioGroup>
                        </FormControl>
                        </div>
                    </Grid>
                    {this.state.value=="0" ?
                    (
                    <Grid container spacing={40}>
                    <Grid item xs={12}/>
                    <Grid item xs={1.5}>
                        <h4>Used: {(this.used/this.state.multiplier).toFixed(2)}{this.unit}</h4>
                    </Grid>
                    <Grid item xs>
                        <LinearProgress
                            style={{height: '45px'}}
                            variant="determinate"
                            value={this.state.completed}
                            className={classes.barColorPrimary}
                            classes={{barColorPrimary:classes.barColorPrimary}}
                            classes={{bar: classes.bar}}  />
                    </Grid>
                    <Grid item xs={1.5}>
                        <h4>Available: {(this.avail/this.state.multiplier).toFixed(2)}{this.unit}</h4>
                    </Grid>
                    </Grid>
                    )
                    :
                    (
                    <Grid container spacing={20}>
                    <Grid item xs/>
                    <Grid item xs={6}>
                    <h5 align="center">Hover over the Doughnut to view the values</h5>
                        <Doughnut data={[
                          {
                            value: (this.used/this.state.multiplier).toFixed(2),
                            color: '#F7464A',
                            highlight: '#FF5A5E',
                            label: 'Used (in' + this.unit + ')'
                          },
                          {
                            value: (this.avail/this.state.multiplier).toFixed(2),
                            color: '#46BFBD',
                            highlight: '#5AD3D1',
                            label: 'Available (in' + this.unit + ')'
                          }
                      ]} options={options} position= 'relative'/>

                    </Grid>
                    <Grid item xs/>
                    </Grid>
                    )
                    }
                    </Grid>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(DiskSpace);
