import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ShowPrelResults extends Component {
  render () {
    const { doesShow, km, traffic, hasBreak } = this.props

    if (!doesShow) {
      return null
    }

    return (
      <ul>
        <li>{km}</li>
        <li>{traffic}</li>
        <li>{hasBreak ? 'inkl 45 min rast' : 'Ingen rast'}</li>
      </ul>
    )
  }
}

ShowPrelResults.propTypes = {
  doesShow: PropTypes.bool,
  km: PropTypes.string,
  traffic: PropTypes.string,
  hasBreak: PropTypes.bool
}

export default ShowPrelResults
