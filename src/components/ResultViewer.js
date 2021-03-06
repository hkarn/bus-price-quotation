import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import LegList from './LegList.js'
import checkIsHoliday from '../functions/holidays-sv'
import moment from 'moment'
import 'moment/locale/sv'
import PropTypes from 'prop-types'

import '../styles/component-styles/ResultView.css'

moment.locale('sv')

class ResultViewer extends Component {
  constructor (props) {
    super(props)

    this.vat = {km: 0.06, hours: 0.06, approach: 0.06, cleaning: 0.06, allowance: 0.25, hotel: 0.25, food: 0.12, ferry: 0.06, tax: 0.25}

    this.state = {
      // start form fields
      ob0amount: 0,
      ob0total: 0,
      ob1amount: 0,
      ob1total: 0,
      ob2amount: 0,
      ob2total: 0,
      ob3amount: 0,
      ob3total: 0,
      kmField: 0,
      kmEmptyField: 0,
      kmTotal: 0,
      kmEmptyTotal: 0,
      approach: 0,
      cleaning: 0,
      allowance: 0,
      hotel: 0,
      food: 0,
      ferry: 0,
      tax: 0,
      discount: 0,
      // end form fields
      total: 0,
      totalvat: 0,
      hasTwoDrivers: false,
      smallGroupDiscount: false,
      baseDiscount: 0
    }
  }

  componentWillReceiveProps (nextProps) {
    const {...props} = this.props

    const prices = this.getPrices()

    if (props.trips !== nextProps.trips) {
      const base = {
        ob0: moment.duration(0),
        ob1: moment.duration(0),
        ob2: moment.duration(0),
        ob3: moment.duration(0),
        km: 0.00,
        kmEmpty: 0.00
      }
      nextProps.trips.forEach(trip => {
        if (trip.isPaid !== false) {
          const thisBase = this.addHours(trip.start, trip.end)
          base.ob0 = base.ob0.add(thisBase.ob0)
          base.ob1 = base.ob1.add(thisBase.ob1)
          base.ob2 = base.ob2.add(thisBase.ob2)
          base.ob3 = base.ob3.add(thisBase.ob3)
          if (trip.type === 'drive') {
            if (trip.empty) {
              base.kmEmpty = parseFloat(base.kmEmpty) + (parseFloat(trip.km.value) / 1000)
            } else {
              base.km = parseFloat(base.km) + (parseFloat(trip.km.value) / 1000)
            }
          }
        }
      })
      const newState = {
        ob0amount: base.ob0.asHours().toFixed(2),
        ob0total: (base.ob0.asHours().toFixed(2) * prices.ob0).toFixed(0),
        ob1amount: base.ob1.asHours().toFixed(2),
        ob1total: (base.ob1.asHours().toFixed(2) * prices.ob1).toFixed(0),
        ob2amount: base.ob2.asHours().toFixed(2),
        ob2total: (base.ob2.asHours().toFixed(2) * prices.ob2).toFixed(0),
        ob3amount: base.ob3.asHours().toFixed(2),
        ob3total: (base.ob3.asHours().toFixed(2) * prices.ob3).toFixed(0),
        kmField: base.km.toFixed(1),
        kmEmptyField: base.kmEmpty.toFixed(1),
        kmTotal: (base.km * prices.km).toFixed(0),
        kmEmptyTotal: (base.km * prices.kmEmpty).toFixed(0)
      }
      this.setState(newState, () => this.reCalculate())
    }
  }

  getPrices = () => {
    const {...props} = this.props

    let prices = {}
    try {
      prices.km = props.prices.km
      prices.kmEmpty = props.prices.kmEmpty
      prices.ob0 = props.prices.ob0.price
      prices.ob1 = props.prices.ob1.price
      prices.ob2 = props.prices.ob2.price
      prices.ob3 = props.prices.ob3.price
    } catch (e) {
      prices = {
        km: 0,
        kmEmpty: 0,
        ob0: 0,
        ob1: 0,
        ob2: 0,
        ob3: 0
      }
    }
    return prices
  }

  addHours = (start, end) => {
    const {prices} = this.props

    const rawResult = [
      moment.duration(0),
      moment.duration(0),
      moment.duration(0),
      moment.duration(0)
    ]

    if (!start.isValid() || !end.isValid()) {
      // All trips are validated on adding so this shouldn't happen unless the user messes around with the devtools, but we can return impossible numbers rather then crashing just in case.
      return {
        ob0: moment.duration(10, 'years'),
        ob1: moment.duration(10, 'years'),
        ob2: moment.duration(10, 'years'),
        ob3: moment.duration(10, 'years')
      }
    }

    // Format breakpoints as date independent times
    const breakpointOB0 = moment(prices.ob0.start, prices.ob0.format)
    const breakpointOB1 = moment(prices.ob0.end, prices.ob0.format)

    // Inner recurisve check function
    function addNextPeriod (start, end) {
      // Helper functions for inner scope
      function getPastDaysToCheck (start) {
        const result = [start.clone()]
        const weekday = start.isoWeekday()
        for (let i = 1; (weekday - i) > 5; i++) {
          result.push(start, start.clone().subtract(i, 'days'))
        }
        return result
      }

      // Check start conditions
      const startTime = moment(start.format(prices.ob0.format), prices.ob0.format) // Format startTime as date indipendent time
      let currentOB = startTime.isBetween(breakpointOB0, breakpointOB1, null, '[)') ? 0 : 1 // sets 0 for day, 1 for night
      const startDate = currentOB === 1 && startTime.hours() >= breakpointOB1.hours() ? start.clone().add(1, 'days') : start.clone() // If night but before midnight use date from day after
      const nextBreakpoint = currentOB === 0
        ? moment(start.format('YYYY-MM-DD') + ' ' + breakpointOB1.format('HH:mm'), 'YYYY-MM-DD HH:mm')
        : moment(startDate.clone().format('YYYY-MM-DD') + ' ' + breakpointOB0.format('HH:mm'), 'YYYY-MM-DD HH:mm') // If day set same evening, if night set next morning
      currentOB = startDate.isoWeekday() > 5 ? 2 : currentOB // sets 2 if weekend
      const pastDaysToCheck = currentOB === 2 ? getPastDaysToCheck(startDate) : [startDate.clone()] // All saturdays and sundays follwoing a holiday are holidays too, get array to check.
      pastDaysToCheck.forEach(day => { // Loop is unnecesary on subsequent recursion but not that heavy so leave for now
        const isHoliday = checkIsHoliday(day) // Returnes false or at index 1: 1 for OB2, and 2 for OB3
        if (isHoliday !== false) { // If false change nothing
          if (isHoliday[1] + 1 > currentOB) {
            currentOB = isHoliday[1] + 1 // Sets the highest value we find from affected dates
          }
        }
      })

      // Check break condtion and add time
      const breakCondition = end.isBefore(nextBreakpoint)
      const duration = end.isBefore(nextBreakpoint) ? moment.duration(end.diff(start)) : moment.duration(nextBreakpoint.diff(start))
      rawResult[currentOB].add(duration)
      if (!breakCondition) {
        addNextPeriod(nextBreakpoint, end)
      }
    }

    // Call first recursion walking thru the passed timespan
    addNextPeriod(start, end)

    // Return result
    return {
      ob0: rawResult[0].clone(),
      ob1: rawResult[1].clone(),
      ob2: rawResult[2].clone(),
      ob3: rawResult[3].clone()
    }
  }

  handleInputChange = (event) => {
    const target = event.target
    const name = target.name
    const value = isNaN(Number(target.value)) || target.value < 0 ? 0 : Number(target.value)
    const prices = this.getPrices()

    if (name === 'ob0total') {
      this.setState({[name]: value, ob0amount: value / prices.ob0}, () => this.reCalculate())
    } else if (name === 'ob1total') {
      this.setState({[name]: value, ob1amount: value / prices.ob1}, () => this.reCalculate())
    } else if (name === 'ob2total') {
      this.setState({[name]: value, ob2amount: value / prices.ob2}, () => this.reCalculate())
    } else if (name === 'ob3total') {
      this.setState({[name]: value, ob3amount: value / prices.ob3}, () => this.reCalculate())
    } else if (name === 'kmTotal') {
      this.setState({[name]: value, kmField: value / prices.km}, () => this.reCalculate())
    } else if (name === 'kmEmptyTotal') {
      this.setState({[name]: value, kmEmptyField: value / prices.kmEmpty}, () => this.reCalculate())
    } else {
      this.setState({[name]: value}, () => this.reCalculate())
    }
  }

  reCalculate = () => {
    const {...state} = this.state
    const prices = this.getPrices()
    const newState = {
      ob0amount: (state.ob0amount * 1).toFixed(2),
      ob1amount: (state.ob1amount * 1).toFixed(2),
      ob2amount: (state.ob2amount * 1).toFixed(2),
      ob3amount: (state.ob3amount * 1).toFixed(2),
      kmField: (state.kmField * 1).toFixed(1),
      kmEmptyField: (state.kmEmptyField * 1).toFixed(1),
      ob0total: (state.ob0amount * prices.ob0).toFixed(0),
      ob1total: (state.ob1amount * prices.ob1).toFixed(0),
      ob2total: (state.ob2amount * prices.ob2).toFixed(0),
      ob3total: (state.ob3amount * prices.ob3).toFixed(0),
      kmTotal: (state.kmField * prices.km).toFixed(0),
      kmEmptyTotal: (state.kmEmptyField * prices.kmEmpty).toFixed(0)
    }

    const driverMultipler = state.hasTwoDrivers ? 2 : 1
    const baseDiscount = state.smallGroupDiscount
      ? ((newState.ob0total * driverMultipler) +
      (newState.ob1total * driverMultipler) +
      (newState.ob2total * driverMultipler) +
      (newState.ob3total * driverMultipler) +
      +newState.kmTotal +
      +newState.kmEmptyTotal) * 0.1
      : 0

    newState.baseDiscount = baseDiscount

    newState.total = (
      (newState.ob0total * driverMultipler) +
      (newState.ob1total * driverMultipler) +
      (newState.ob2total * driverMultipler) +
      (newState.ob3total * driverMultipler) +
      +newState.kmTotal +
      +newState.kmEmptyTotal +
      +state.approach +
      +state.cleaning +
      +state.allowance +
      +state.hotel +
      +state.food +
      +state.ferry +
      +state.tax -
      +state.discount
    ).toFixed(0)

    const totalafterdiscount = []

    totalafterdiscount[0] = Number(newState.ob0total * driverMultipler)
    totalafterdiscount[1] = Number(newState.ob1total * driverMultipler)
    totalafterdiscount[2] = Number(newState.ob2total * driverMultipler)
    totalafterdiscount[3] = Number(newState.ob3total * driverMultipler)
    totalafterdiscount[4] = Number(newState.kmTotal)
    totalafterdiscount[5] = Number(newState.kmEmptyTotal)

    let remainingDiscount = Number(state.discount) + Number(baseDiscount)

    const mappedafterdiscount = totalafterdiscount.map(item => {
      if (Number(item) >= Number(remainingDiscount)) {
        const newItem = item - remainingDiscount
        remainingDiscount = 0
        return newItem
      } else {
        const newItem = 0
        remainingDiscount = remainingDiscount - item
        return newItem
      }
    })

    if (remainingDiscount > 0) {
      // silently reduced discount to maximum possible (discount only makes sense on milage and hours)
      const newDiscount = state.discount - remainingDiscount
      this.setState({discount: newDiscount}, () => this.reCalculate())
      return
    }

    newState.totalvat = (
      (mappedafterdiscount[0] * this.vat.hours) +
      (mappedafterdiscount[1] * this.vat.hours) +
      (mappedafterdiscount[2] * this.vat.hours) +
      (mappedafterdiscount[3] * this.vat.hours) +
      (mappedafterdiscount[4] * this.vat.km) +
      (mappedafterdiscount[5] * this.vat.km) +
      (state.approach * this.vat.approach) +
      (state.cleaning * this.vat.cleaning) +
      (state.allowance * this.vat.allowance) +
      (state.hotel * this.vat.hotel) +
      (state.food * this.vat.food) +
      (state.ferry * this.vat.ferry) +
      (state.tax * this.vat.tax)
    ).toFixed(0)

    this.setState({...state, ...newState})
  }

  clearZeroFieldValue = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name
    if (+value === 0) {
      this.setState({[name]: ''})
    }
  }

  setZeroOnClerField = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name
    if (value === '') {
      this.setState({[name]: 0})
    }
  }

  render () {
    const {...props} = this.props
    const {...state} = this.state

    const prices = this.getPrices()

    return (
      <div className="result-box">
        <h1>Resultat</h1>
        <div className="result-options">
          <p style={{textAlign: 'center'}}>
            <input type="checkbox" id="less-then-30" name="smallGroupDiscount" checked={state.smallGroupDiscount} onChange={e => { this.setState({smallGroupDiscount: e.target.checked}, () => this.reCalculate()) }} />
            <label htmlFor="less-then-30">Under 30 personer</label>

            <input type="checkbox" id="two-drivers" name="hasTwoDrivers" checked={state.hasTwoDrivers} onChange={e => { this.setState({hasTwoDrivers: e.target.checked}, () => this.reCalculate()) }} />
            <label style={{marginLeft: '20px'}} htmlFor="two-drivers">Två förare</label>
          </p>
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
              <th>Km</th>
              <td>{prices.km}</td>
              <td>{this.vat.km * 100}%</td>
              <td><input name="kmField" type="number" value={state.kmField} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /></td>
              <td><input name="kmTotal" className="nospinner" type="number" value={state.kmTotal} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th>Km (tom)</th>
              <td>{prices.kmEmpty}</td>
              <td>{this.vat.km * 100}%</td>
              <td><input name="kmEmptyField" type="number" value={state.kmEmptyField} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /></td>
              <td><input name="kmEmptyTotal" className="nospinner" type="number" value={state.kmEmptyTotal} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th>Tim OB0</th>
              <td>{prices.ob0}</td>
              <td>{this.vat.hours * 100}%</td>
              <td><input name="ob0amount" type="number" value={state.ob0amount} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /></td>
              <td><input name="ob0total" className="nospinner" type="number" value={state.ob0total} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th>Tim OB1</th>
              <td>{prices.ob1}</td>
              <td>{this.vat.hours * 100}%</td>
              <td><input name="ob1amount" type="number" value={state.ob1amount} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /></td>
              <td><input name="ob1total" className="nospinner" type="number" value={state.ob1total} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th>Tim OB2</th>
              <td>{prices.ob2}</td>
              <td>{this.vat.hours * 100}%</td>
              <td><input name="ob2amount" type="number" value={state.ob2amount} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /></td>
              <td><input name="ob2total" className="nospinner" type="number" value={state.ob2total} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th>Tim OB3</th>
              <td>{prices.ob3}</td>
              <td>{this.vat.hours * 100}%</td>
              <td><input name="ob3amount" type="number" value={state.ob3amount} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /></td>
              <td><input name="ob3total" className="nospinner" type="number" value={state.ob3total} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="2">Framkörning</th>
              <td colSpan="2">{this.vat.approach * 100}%</td>
              <td><input name="approach" className="nospinner" type="number" value={state.approach} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="2">Städning</th>
              <td colSpan="2">{this.vat.cleaning * 100}%</td>
              <td><input name="cleaning" className="nospinner" type="number" value={state.cleaning} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="2">Traktamente</th>
              <td colSpan="2">{this.vat.allowance * 100}%</td>
              <td><input name="allowance" className="nospinner" type="number" value={state.allowance} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="2">Hotel</th>
              <td colSpan="2">{this.vat.hotel * 100}%</td>
              <td><input name="hotel" className="nospinner" type="number" value={state.hotel} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="2">Måltider</th>
              <td colSpan="2">{this.vat.food * 100}%</td>
              <td><input name="food" className="nospinner" type="number" value={state.food} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="2">Färjor</th>
              <td colSpan="2">{this.vat.ferry * 100}%</td>
              <td><input name="ferry" className="nospinner" type="number" value={state.ferry} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="2">Vägskatter</th>
              <td colSpan="2">{this.vat.tax * 100}%</td>
              <td><input name="tax" className="nospinner" type="number" value={state.tax} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            <tr>
              <th colSpan="4">Manuell rabatt (exkl moms)</th>
              <td><input name="discount" type="number" value={state.discount} onChange={this.handleInputChange} onFocus={this.clearZeroFieldValue} onBlur={this.setZeroOnClerField} /> kr</td>
            </tr>
            {state.baseDiscount !== 0 ? (<tr>
              <th colSpan="4">Rabatt (under 30 pers)</th>
              <td>{state.baseDiscount.toFixed(0)} kr</td>
            </tr>) : null}
            <tr>
              <th colSpan="4" style={{fontWeight: 'bold', fontSize: '1.21em'}}>Totalt</th>
              <td style={{fontWeight: 'bold', fontSize: '1.2em'}}>{(+state.total).toFixed(0)} kr</td>
            </tr>
            <tr>
              <th colSpan="4" style={{fontWeight: 'bold', fontSize: '1.1em'}}>inkl. moms</th>
              <td style={{fontWeight: 'bold', fontSize: '1.1em'}}>{(+state.total + +state.totalvat).toFixed(0)} kr</td>
            </tr>
          </tbody>
        </table>
        <div className="result-box-routes">
          <LegList trips={props.trips} />
        </div>
      </div>
    )
  }
}

ResultViewer.propTypes = {
  prices: PropTypes.object,
  trips: PropTypes.array
}

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch)

const mapStateToProps = (state) => {
  return {
    trips: state.trips,
    prices: state.prices
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultViewer)
