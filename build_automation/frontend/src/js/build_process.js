import React from 'react';

import MakeBuildComponent from './make_build.js';
import ViewBuildComponent from './view_build.js';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';

class BuildProcessComponent extends React.Component{
  constructor(props) {
        super(props);
        this.state = {
            currentTab: 'makebuild',
            builtLayout : {}
        };
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleData = this.handleData.bind(this);
    }

  handleTabClick(event, selectedTab) {
        this.setState({ currentTab: selectedTab });
      };

  handleData(builtLayout){
        console.log("buildprocess")
        console.log(builtLayout);
        this.setState({
            builtLayout: builtLayout
        });
    }

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
                            <Tab value="makebuild" label="Make Build" />
                            <Tab value="viewbuild" label="View Build" />
                        </Tabs>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '20px'}}>
                <Grid item xs={12}>
                    {currentTab == 'makebuild' && <MakeBuildComponent handlerFromParent={this.handleData}/>}
                    {currentTab == 'viewbuild' && <ViewBuildComponent built={this.state.builtLayout}/>}
                </Grid>
            </Grid>
        </React.Fragment>
    )
  }
}

module.exports = BuildProcessComponent;
