import React, { Component } from 'react'
import _ from 'underscore'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { removeLeg } from '../actions'
import moment from 'moment'
import 'moment/locale/sv'

moment.locale('sv')

class LegList extends Component {
  render () {
    const {...props} = this.props
    if (props.trips.length < 1) {
      return (
        <ul><li>
          Det finns inga körningar eller raster i detta uppdrag ännu.
        </li></ul>
      )
    }

    const sortedTrips = _.sortBy(props.trips, 'start')
    const listTrips = sortedTrips.map(trip => {
      let result = null
      if (trip.type === 'drive') {
        result = (<li key={trip.index}>
          <h1>Körning {trip.start.calendar().toLowerCase()}</h1>
          <p>{trip.start.format('HH:mm ddd D/M')} {trip.from}</p>
          <p>-></p>
          <p>{trip.end.format('HH:mm ddd D/M')} {trip.to}</p>
          <p>
            Arbetstid: {trip.duration.text}
            {trip.break ? ' (inkl 45 min rast)' : null}
          </p>
          <button onClick={() => { props.removeLeg(trip.index) }}>Ta bort från uppdrag</button>
        </li>)
      }
      if (trip.type === 'other') {
        const isPaidString1 = trip.isPaid ? 'betald' : 'obetald'
        const isPaidString2 = trip.isPaid ? 'Arbets' : 'Övrig '
        result = (<li key={trip.index}>
          <h1>Övrig {isPaidString1} tid {trip.start.calendar().toLowerCase()}</h1>
          <p>{trip.start.format('HH:mm ddd D/M')}</p>
          <p>-></p>
          <p>{trip.end.format('HH:mm ddd D/M')}</p>
          <p>
            {isPaidString2}tid: {trip.duration.text}
          </p>
          <button onClick={() => { props.removeLeg(trip.index) }}>Ta bort från uppdrag</button>
        </li>)
      }
      return result
    })

    return (
      <ul>
        {listTrips}
      </ul>
    )
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  removeLeg
}, dispatch)

export default connect(null, mapDispatchToProps)(LegList)
