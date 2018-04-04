import React from 'react';
import TextField from 'material-ui/TextField';

class MakeBuildDirlayoutInfo extends React.Component{
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
            id: props.info.id,
            name: props.info.name,
            description: props.info.description
        };
    }

     componentWillReceiveProps(props) {
        this.setState({
            id: props.info.id,
            name: props.info.name,
            description: props.info.description
        });
    }

    render(){

        return(
            <div>
                <label>Name</label>
                <TextField
                  id="name"
                  value={this.state.name}
                  fullWidth
                  margin="normal"
                />

                <label>Description</label>
                <TextField
                  id="description"
                  multiline
                  fullWidth
                  value={this.state.description}
                  margin="normal"
                />
            </div>
        )
    }
}

module.exports = MakeBuildDirlayoutInfo