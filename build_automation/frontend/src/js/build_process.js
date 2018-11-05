import React from 'react';

import Grid from '@material-ui/core/Grid';
import MakeBuildComponent from './make_build.js';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ViewBuildComponent from './view_build.js';

class BuildProcessComponent extends React.Component{
  constructor(props) {
        super(props);
        this.state = {
            currentTab: 'makebuild',
            builtLayout : {}
        };
        this.handleTabClick = this.handleTabClick.bind(this);
    }

  handleTabClick(event, selectedTab) {
        this.setState({ currentTab: selectedTab });
      };

  render() {
    const currentTab = this.state.currentTab;
    return (
        <React.Fragment>
            <Grid container style={{overflow: 'hidden', flexGrow: 1}}>
                <Grid item xs={12}>
                    <Paper>
                        <Tabs
                            style={{background: '#3f51b5', color:'white'}}
                            value={currentTab}
                            onChange={this.handleTabClick}
                        >
                            <Tab value="makebuild" label="Make Image" />
                            <Tab value="viewbuild" label="View Latest Image" />
                        </Tabs>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '20px'}}>
                <Grid item xs={12}>
                    {currentTab == 'makebuild' && <MakeBuildComponent />}
                    {currentTab == 'viewbuild' && <ViewBuildComponent />}
                </Grid>
            </Grid>
        </React.Fragment>
    )
  }
}

export default BuildProcessComponent;
