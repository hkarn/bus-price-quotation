import React from 'react'
import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

const Settings = props => (
  <div>
    <h1>Settings</h1>
    <p>Welcome home!</p>
    <button onClick={() => props.changePage()}>Go to about page via redux</button>
  </div>
)

Settings.propTypes = {
  changePage: PropTypes.func
}

const mapDispatchToProps = dispatch => bindActionCreators({
  changePage: () => push('/')
}, dispatch)

export default connect(
  null,
  mapDispatchToProps
)(Settings)
