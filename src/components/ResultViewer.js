import React, { Component } from 'react';
import { bindActionCreators }from 'redux'
import { connect } from 'react-redux'





class ResultViewer extends Component {

  
  
  
  
  render() {

    return (
      <div className="startuplogic"> 
      </div>
    );

  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  
}, dispatch)

export default connect(null, mapDispatchToProps)(ResultViewer);