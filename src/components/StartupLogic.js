import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {readPrices} from '../actions/'

// TODO
// Fix this implimentation of startup

class StartupLogic extends Component {
  componentDidMount () {
    const { readPrices } = this.props
    readPrices()
  }

  render () {
    return (
      <div className="startuplogic no-print" />
    )
  }
}

StartupLogic.propTypes = {
  readPrices: PropTypes.func
}

const mapDispatchToProps = dispatch => bindActionCreators({
  readPrices
}, dispatch)

export default connect(null, mapDispatchToProps)(StartupLogic)
