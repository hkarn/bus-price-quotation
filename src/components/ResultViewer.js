import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import LegList from './LegList.js'
import checkIsHoliday from '../functions/holidays-sv'
import moment from 'moment'
import 'moment/locale/sv'

moment.locale('sv')

class ResultViewer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ob0: moment.duration(0),
      ob1: moment.duration(0),
      ob2: moment.duration(0),
      ob3: moment.duration(0)
    }

  }

  componentWillReceiveProps (nextProps) {
    const {trips} = this.props

    if (trips !== nextProps.trips) {
      nextProps.trips.forEach(trip => {
        this.addHours(trip.start, trip.end)
      })
    }
  }

  addHoursNextDay = (start, end, prices, ob = 'ob0') => {
    const startTime = moment(start.format(prices.ob0.format), prices.ob0.format)
    const endTime = moment(end.format(prices.ob0.format), prices.ob0.format)
    const startDay = moment(prices.ob0.start, prices.ob0.format)
    const endDay = moment(prices.ob0.end, prices.ob0.format)
    if (start.isSame(end, 'day') && endTime.isBetween(startDay, endDay)) {
      // Ends in same day before salary break
      const duration = moment.duration(start.diff(end))
      this.setState(prevState => prevState[ob].clone().add(duration))
    } else {
      const duration = moment.duration(startTime.diff(endDay))
      this.setState(prevState => prevState[ob].clone().add(duration))
      const newStart = moment(start.format('Y-M-D') + ' ' + prices.ob0.end, 'Y-M-D ' + prices.ob0.format)
      this.addHours(newStart, end)
    }
  }

  addHoursNextNight = (start, end, prices, ob = 'ob1') => {
    const startTime = moment(start.format(prices.ob1.format), prices.ob1.format)
    const endTime = moment(end.format(prices.ob1.format), prices.ob1.format)
    const startNight = moment(prices.ob1.start, prices.ob1.format)
    const endNight = moment(prices.ob1.end, prices.ob1.format)
    if (start.clone().add(1, 'days').isSame(end, 'day') && (endTime.isBefore(endNight) || endTime.isAfter(startNight))) {
      // Ends in same night before salary break
      const duration = moment.duration(start.diff(end))
      this.setState(prevState => prevState[ob].clone().add(duration))
    } else {
      const duration = moment.duration(startTime.diff(endNight))
      this.setState(prevState => prevState[ob].clone().add(duration))
      const newStart = moment(start.clone().add(1, 'days').format('Y-M-D') + ' ' + prices.ob1.end, 'Y-M-D ' + prices.ob1.format)
      this.addHours(newStart, end)
    }
  }

  addHours = (start, end) => {
    const {prices} = this.props

    const startTime = moment(start.format(prices.ob0.format), prices.ob0.format)
    const endTime = moment(end.format(prices.ob0.format), prices.ob0.format)
    const startDay = moment(prices.ob0.start, prices.ob0.format)
    const endDay = moment(prices.ob0.end, prices.ob0.format)

    if (startTime.isBetween(startDay, endDay)) {
      // Is day
      let ob = 'ob0'
      if (checkIsHoliday(start) !== false) {
        if (checkIsHoliday(start)[1] === 2) {
          ob = 'ob3'
        } else {
          ob = 'ob2'
        }
      } else if (start.isoWeekday() > 5) {
        // Is weekend
        ob = 'ob2'
      } else {
        //Is workday
        ob = 'ob0'
      }
      this.addHoursNextDay(start, end, prices, ob)
    } else {
      // Is night
      let ob = 'ob1'
      if (checkIsHoliday(start.clone().add(1, 'days')) !== false) {
        if (checkIsHoliday(start.clone().add(1, 'days'))[1] === 2) {
          ob = 'ob3'
        } else {
          ob = 'ob2'
        }
      } else if (start.clone().add(1, 'days').isoWeekday() > 5) {
        // Is weekend
        ob = 'ob2'
      } else {
        // Is worknight
        ob = 'ob1'
      }
      this.addHoursNextNight(start, end, prices, ob)
    }
  }

  render () {
    const {trips} = this.props
    return (
      <div className="result-box">
        <h1>Resultat</h1>
        <div className="result-box-routes">
          <LegList trips={trips} />
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
              <td>{this.state.ob0.asHours()}</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tim OB1</th>
              <td>350</td>
              <td>6%</td>
              <td>{this.state.ob1.asHours()}</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tim OB2</th>
              <td>380</td>
              <td>6%</td>
              <td>{this.state.ob2.asHours()}</td>
              <td>5 000kr</td>
            </tr>
            <tr>
              <th>Tim OB3</th>
              <td>420</td>
              <td>6%</td>
              <td>{this.state.ob3.asHours()}</td>
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
    trips: state.trips,
    prices: state.prices
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultViewer)
