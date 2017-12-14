import React, { Component } from 'react';



class ShowPrelResults extends Component {

 
  render() {
    if (!this.props.doesShow) {
      return null
    }

    return (
      <ul>
        <li>{this.props.km}</li>
        <li>{this.props.traffic}</li>
        <li>{this.props.break ? "inkl 45 min rast" : "Ingen rast"}</li>  
      </ul>
    );

  }
}


export default ShowPrelResults