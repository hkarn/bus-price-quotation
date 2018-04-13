import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {readPrices} from '../actions/'

class StartupLogic extends Component {
  componentDidMount () {
    const { readPrices } = this.props
    readPrices()
  }

  render () {
    return (
      <div className="startuplogic" />
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
