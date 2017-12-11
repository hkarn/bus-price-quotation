import React, { Component } from 'react';
import { bindActionCreators }from 'redux'
import { connect } from 'react-redux'





class ResultViewer extends Component {

  
  
  
  
  render() {

    return (
      <div className="result-box"> 
        <h1>Resultat</h1>
        
        <table>
          <thead>          
            <tr>
              <th></th>
              <th>á pris</th>
              <th>Pris</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Mil</th>
              <td>115</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tom</th>
              <td>100</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB1</th>
              <td>350</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB2</th>
              <td>380</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB3</th>
              <td>420</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>OB4</th>
              <td>460</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Traktamente</th>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Totalt</th>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>Moms 6%</th>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th colSpan='2'>inkl. moms</th>
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

export default connect(null, mapDispatchToProps)(ResultViewer);