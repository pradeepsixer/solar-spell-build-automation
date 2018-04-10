import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class MakeBuildDirlayoutInfo extends React.Component{
    constructor(props){
        super(props);
        console.log(props)
        this.state = {
            id: props.info.id,
            name: props.info.name,
            description: props.info.description,
            currTime: null,
            data:{}
        };
        this.submitHandler = this.submitHandler.bind(this);
    }

     componentWillReceiveProps(props) {
        const data={
            id: props.info.id,
            name: props.info.name,
            description: props.info.description,
            currTime: new Date().toLocaleString(),
            loaded: 6000,
        }
        this.setState({
            id: props.info.id,
            name: props.info.name,
            description: props.info.description,
           // info: props.info
            data:data
        });
    }

    submitHandler(evt){
        //call api
        evt.preventDefault();
        this.props.handlerFromParent(this.state.data)
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
                <Button variant="raised" color="primary" onClick={this.submitHandler}>
                    Start Build
                </Button>
            </div>
        )
    }
}

module.exports = MakeBuildDirlayoutInfo