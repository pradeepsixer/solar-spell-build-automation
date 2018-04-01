import React from 'react';

class BuildProcessComponent extends React.Component{
    constructor(props) {
    super(props)

    this.state = {
      username: 'saranya'
    }
  }
  render() {
    return (
      <div>
        Hello {this.state.username}
      </div>
    )
  }
}

module.exports = BuildProcessComponent;
