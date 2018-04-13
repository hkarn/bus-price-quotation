import React from 'react'
import { connect } from 'react-redux'

import Planner from '../../components/Planner'
import ResultViewer from '../../components/ResultViewer'

import '../../styles/container-styles/home.css'

const Home = props => (
  <div className="price-counter-page">
    <div className="left">
      <Planner />
    </div>

    <div className="right">

      <ResultViewer />
    </div>

  </div>
)

export default connect(
  null
)(Home)
