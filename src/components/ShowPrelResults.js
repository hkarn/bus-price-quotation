import React, { Component } from 'react';



class ShowPrelResults extends Component {

 
  render() {
    if (!this.props.doesShow) {
      return null
    }

    return (
      <ul>
        <li>{this.props.km}</li>
        <li>{this.props.no_traffic}</li>
        <li>{this.props.traffic} med trafik</li>
      </ul>
    );

  }
}


export default ShowPrelResults