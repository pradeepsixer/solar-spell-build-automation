import React from 'react';

import DirectoryLayoutComponent from './directory_layout.js';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';

class MainScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 2
        };
        this.handleTabClick = this.handleTabClick.bind(this);
    }

    handleTabClick(event, value) {
        this.setState({ value: value });
      };

    render() {
        return (
            <React.Fragment>
            <Grid container style={{backgroundColor: '#2196f3', height: '100px', flexGrow: 1, overflow: 'hidden'}} justify="center">
                <Grid item xs={12}>
                    <Grid container justify="center" alignItems="flex-end" style={{height: '100%'}}>
                        <Grid item>
                            <Typography gutterBottom variant="headline" style={{ color: '#ffffff' }}>
                                SolarSPELL
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container style={{overflow: 'hidden', flexGrow: 1}}>
                <Grid item xs={12}>
                    <Paper>
                        <Tabs
                            value={this.state.value}
                            indicatorColor="secondary"
                            onChange={this.handleTabClick}
                            textColor="secondary"
                            centered
                            >
                            <Tab label="Tags" />
                            <Tab label="Contents" />
                            <Tab label="Directory Layout" />
                            <Tab label="Builds" />
                            <Tab label="System Info" />
                        </Tabs>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '20px'}}>
                <Grid item xs={12}>
            <DirectoryLayoutComponent />
            </Grid>
            </Grid>
            </React.Fragment>
        );
    }
}

module.exports = MainScreen;
