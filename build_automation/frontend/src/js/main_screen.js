import React from 'react';

import DirectoryLayoutComponent from './directory_layout.js';
import ContentManagement from './content_management.js';
import DiskSpace from './diskspace.js';
import TagManagement from './tag_management';

import Badge from 'material-ui/Badge';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import {APP_URLS} from "./url";
import axios from 'axios';



import solarSpellLogo from '../images/logo.png';
import '../css/style.css';

const styles = theme => ({
    padding: {
     padding: `0 ${theme.spacing.unit * 2}px`,
   },
});

class MainScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: 'dirlayout',
            showBadge: false
        };
        this.handleTabClick = this.handleTabClick.bind(this);
    }

    handleTabClick(event, selectedTab) {
        this.setState({ currentTab: selectedTab });
      };

    componentDidMount() {
        this.timerID = setInterval(
            () => this.showBadge(),1000*60*60
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    showBadge() {
        axios
            .get(APP_URLS.DISKSPACE, {responseType: 'json'})
            .then((response) => {
                this.used = 100*(response.data.total_space-response.data.available_space)/response.data.total_space
                this.setState({completed: 100*(response.data.total_space-response.data.available_space)/response.data.total_space});
            })
            .catch((error) => {
                console.log(error);
                // TODO : Show the error message.
            });
        if(this.used > 80) {
            this.setState({showBadge: true})
        }
        else {
            this.setState({showBadge: false})
        }
    }

    render() {
        const currentTab = this.state.currentTab;
        const { classes } = this.props;

        return (
            <React.Fragment>
            <Grid container style={{backgroundColor: '#2196f3', height: '100px', flexGrow: 1, overflow: 'hidden'}} justify="center">
                <Grid item xs={12}>
                    <Grid container justify="center" alignItems="flex-end" style={{height: '100%'}}>
                        <Grid item>
                            <img src={solarSpellLogo} className="spellLogo" />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container style={{overflow: 'hidden', flexGrow: 1}}>
                <Grid item xs={12}>
                    <Paper>
                        <Tabs
                            value={currentTab}
                            indicatorColor="secondary"
                            onChange={this.handleTabClick}
                            textColor="secondary"
                            centered
                        >
                            <Tab value="tags" label="Metadata" />
                            <Tab value="contents" label="Contents" />
                            <Tab value="dirlayout" label="Library Versions" />
                            <Tab value="builds" label="Builds" />
                            { this.state.showBadge ? (<Tab value="sysinfo" label= {
                                                    <Badge className= {classes.padding} color="secondary" badgeContent={'!'}>
                                                    System Info
                                                    </Badge>
                                                }/>) : (<Tab value="sysinfo" label="System Info" />)
                            }
                        </Tabs>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '20px'}}>
                <Grid item xs={12}>
                    {currentTab == 'dirlayout' && <DirectoryLayoutComponent />}
                    {currentTab == 'contents' && <ContentManagement />}
                    {currentTab == 'tags' && <TagManagement/>}
                    {currentTab == 'sysinfo' && <DiskSpace/>}
                </Grid>
            </Grid>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(MainScreen);
