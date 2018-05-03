import React, { Component } from 'react'
import _ from 'underscore'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { removeLeg } from '../actions'
import moment from 'moment'
import 'moment/locale/sv'
import faLongArrowAltRight from '@fortawesome/fontawesome-free-solid/faLongArrowAltRight'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

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
    let lastEnd = {}
    let index = 0
    const listTrips = sortedTrips.map(trip => {
      const result = []
      if (index > 0) {
        const dur = moment.duration(trip.start.diff(lastEnd))
        if (Math.abs(dur.asMinutes()) > 9) {
          result.push(<p key={trip.index + 'warning'} className="red">Skiljer {dur.humanize()} från förra uppdragsdelens sluttid!</p>)
        }
      }
      lastEnd = trip.end
      index++
      if (trip.type === 'drive') {
        result.push(<li key={trip.index}>
          <div><h1>Körning {trip.start.calendar().toLowerCase()}</h1><button onClick={() => { props.removeLeg(trip.index) }}>Ta bort från uppdrag</button></div>
          <p>{trip.start.format('HH:mm ddd D/M')} <i>{trip.from.replace(', Sverige', '')}</i></p>
          <p className="nowrap"><FontAwesomeIcon icon={faLongArrowAltRight} /></p>
          <p>{trip.end.format('HH:mm ddd D/M')} <i>{trip.to.replace(', Sverige', '')}</i></p>
          <p className="block">
            <a className="btn" href="open map" onClick={(e) => { e.preventDefault(); window.open('https://www.google.com/maps/dir/?api=1&origin=' + encodeURI(trip.from) + '&destination=' + encodeURI(trip.to) + '&travelmode=driving', 'Karta', 'scrollbars=yes,width=1200,height=800') }}>Karta</a>
            Arbetstid: {trip.duration.text}
            {trip.break ? ' (inkl 45 min rast)' : null}
          </p>
        </li>)
      }
      if (trip.type === 'other') {
        const isPaidString1 = trip.isPaid ? 'betald' : 'obetald'
        const isPaidString2 = trip.isPaid ? 'Arbets' : 'Övrig '
        result.push(<li key={trip.index}>
          <div><h1>Övrig {isPaidString1} tid {trip.start.calendar().toLowerCase()}</h1><button onClick={() => { props.removeLeg(trip.index) }}>Ta bort från uppdrag</button></div>
          <p>{trip.start.format('HH:mm ddd D/M')}</p>
          <p className="nowrap"><FontAwesomeIcon icon={faLongArrowAltRight} /></p>
          <p>{trip.end.format('HH:mm ddd D/M')}</p>
          <p className="block">
            {isPaidString2}tid: {trip.duration.text}
          </p>

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
