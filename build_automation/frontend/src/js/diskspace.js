import React from 'react';
import {APP_URLS} from "./url";
import axios from 'axios';
import LinearProgress from 'material-ui/Progress/LinearProgress';
import Grid from 'material-ui/Grid';
import { withStyles } from "material-ui/styles";
import Select from 'material-ui/Select';
import { FormControl } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';


const styles = {
    root: {
    flexGrow: 1
    },
    barColorPrimary: {
        backgroundColor: "#499E2F"
    },
    bar: {
        background: "#FF3B29"
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
        };
        this.unit = " MB"
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ multiplier: event.target.value, [event.target.name]: event.target.value });
        console.log(event.target.value)
        if(event.target.value == 1048576) {
            this.unit = " MB"
        }
        if(event.target.value == 1073741824) {
        this.unit = " GB";
        }
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
                console.log(error);
                // TODO : Show the error message.
            });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <div style={{padding:20}}>
                    <Grid container spacing={40}>
                    <Grid item xs={12}>
                    <h1>DiskSpace</h1>
                    </Grid>
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
                        <form className={classes.root} autoComplete="off">
                        <FormControl>
                        <InputLabel htmlFor=""></InputLabel>
                        <Select
                        value={this.state.multiplier}
                        onChange={this.handleChange}
                        >
                            <MenuItem value={1048576}>MB</MenuItem>
                            <MenuItem value={1073741824}>GB</MenuItem>
                        </Select>
                        </FormControl>
                        </form>
                    </Grid>
                    <Grid item xs={1.5}>
                        <h4>Available: {(this.avail/this.state.multiplier).toFixed(2)}{this.unit}</h4>
                    </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(DiskSpace);
