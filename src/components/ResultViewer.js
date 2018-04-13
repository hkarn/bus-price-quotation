import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import LegList from './LegList.js'

class ResultViewer extends Component {
  render () {
    const {...props} = this.props
    return (
      <div className="result-box">
        <h1>Resultat</h1>
        <div className="result-box-routes">
          <LegList trips={props.trips} />
        </div>
        <table className="result-box-table">
          <thead>
            <tr>
              <th />
              <th>á pris</th>
              <th>Moms</th>
              <th>Antal</th>
              <th>Pris</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Mil</th>
              <td>115</td>
              <td>6%</td>
              <td>0</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tommil</th>
              <td>100</td>
              <td>6%</td>
              <td>0</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Timmar</th>
              <td>350</td>
              <td>6%</td>
              <td>0</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tim OB1</th>
              <td>350</td>
              <td>6%</td>
              <td>0</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tim OB2</th>
              <td>380</td>
              <td>6%</td>
              <td>0</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tim OB3</th>
              <td>420</td>
              <td>6%</td>
              <td>0</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tim OB4</th>
              <td>460</td>
              <td>6%</td>
              <td>0</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan="2">Traktamente</th>
              <td colSpan="2">25%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan="2">Hotel</th>
              <td colSpan="2">25%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan="2">Måltider</th>
              <td colSpan="2">12%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan="2">Färjor</th>
              <td colSpan="2">6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan="2">Vägskatter</th>
              <td colSpan="2">25%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan="4">Totalt</th>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan="4">inkl. moms</th>
              <td>5 000kr</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch)

const mapStateToProps = (state) => {
  return {
    trips: state.trips
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultViewer)
