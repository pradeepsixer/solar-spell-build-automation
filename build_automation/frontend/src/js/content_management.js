import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import AutoCompleteWithChips from './autocomplete.js';
import {APP_URLS} from "./url";
import axios from 'axios';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});



class ContentManagement extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            tags: []
        }
    }
    componentDidMount() {
        this.loadData()
    }
    loadData() {
        const currInstance = this;
        axios.get(APP_URLS.TAG_LIST, {
            responseType: 'json'
        }).then(function (response) {
            currInstance.setState({
                tags: response.data
            })
        }).catch(function (error) {
            console.log(error);
            // TODO : Show the error message.
        });
    }
    render(){
    return (
        <div>
        <h3>Content Management</h3>
         <input
        accept="*"
        className={'hidden'}
        id="raised-button-file"
        multiple
        type="file"
      />
      <label htmlFor="raised-button-file">
        <Button variant="raised" component="span">
          Upload
        </Button>
      </label>
            <AutoCompleteWithChips suggestions={this.state.tags} searchKey={'name'} selectedItem={[]} onChange={evt => console.log(evt)}/>
        </div>
    )
    }
}
module.exports = ContentManagement;
