import React, { Component } from 'react';
import { bindActionCreators }from 'redux'
import { connect } from 'react-redux'


import {readPrices} from '../actions/'


class StartupLogic extends Component {

  
  componentDidMount() {
    this.props.readPrices()
  }
  
  
  render() {

    return (
      <div className="startuplogic"> 
      </div>
    );

  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  readPrices
}, dispatch)

export default connect(null, mapDispatchToProps)(StartupLogic);