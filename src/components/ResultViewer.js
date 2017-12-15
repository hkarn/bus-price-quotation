import React, { Component } from 'react';
import { bindActionCreators }from 'redux'
import { connect } from 'react-redux'

import LegList from './LegList.js'



class ResultViewer extends Component {

 
  render() {
    return (
      <div className='result-box'> 
        <h1>Resultat</h1>
        <div className='result-box-routes'>
          <LegList trips={this.props.trips} />
        </div>
        <table className='result-box-table'>
          <thead>          
            <tr>
              <th></th>
              <th>á pris</th>
              <th>Momssats</th>
              <th>Pris</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Mil</th>
              <td>115</td>
              <td>6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tom</th>
              <td>100</td>
              <td>6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB1</th>
              <td>350</td>
              <td>6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB2</th>
              <td>380</td>
              <td>6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB3</th>
              <td>420</td>
              <td>6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB4</th>
              <td>460</td>
              <td>6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Traktamente</th>
              <td>25%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Hotel</th>
              <td>25%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Måltider</th>
              <td>12%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Färjor</th>
              <td>6%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Vägskatter</th>
              <td>25%</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='3'>Totalt</th>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='3'>inkl. moms</th>
              <td>5 000kr</td>
            </tr>
          </tbody>
          </table>
      </div>
    );

  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  
}, dispatch)

const mapStateToProps = (state) => {return {
  trips: state.trips,
}}

export default connect(mapStateToProps, mapDispatchToProps)(ResultViewer);