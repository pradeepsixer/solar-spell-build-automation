import axios from 'axios';
import React from 'react';

class DirectoryLayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            data: []
        }
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.loadData(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    loadData() {
        const currentComponent = this;
        axios.get('/api/dirlayouts/', {
                transformResponse: [
                    function(data) {
                        console.log(data);
                        return data;
                    }
                ]
            })
            .then(function(response) {
                currentComponent.setState((prevState, props) => ({
                    isLoaded: true,
                }));
            })
            .catch(function(error) {
                console.error('Error has occurred when trying to get the list of directories.');
                console.log(error);
            });
    }

    render() {
        return <h1> Directory Layout - Load Status { this.state.isLoaded + "" } </h1>;
    }
}

module.exports = DirectoryLayoutComponent;
