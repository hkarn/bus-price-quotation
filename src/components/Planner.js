import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import ReactDependentScript from 'react-dependent-script'
import SelectAddress from './SelectAddress'
import DateTime from 'react-datetime'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faAngleRight from '@fortawesome/fontawesome-free-solid/faAngleRight'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'

import config from '../config/config.js'

import {addLeg} from '../actions'

import moment from 'moment'
import 'moment/locale/sv'

import '../styles/react-datetime.css'
import '../styles/component-styles/Planner.css'

import ShowPrelResults from './ShowPrelResults'

import { durationToString } from '../functions'

moment.locale('sv')

class Planner extends Component {
  constructor (props) {
    super(props)
    this.state = {
      start: moment().add(6, 'hours'),
      end: null,
      breakstart: moment().add(6, 'hours'),
      breakend: moment().add(6, 'hours'),
      fromField: '',
      toField: '',
      km: null,
      traffic: null,
      response: null,
      break45: false, // 45 min break included in time (all durations above 4.5 hours)
      multidriver: false,
      showResult: false,
      searchOpts: {}
    }
    this.setSearchOptsTimer = null
  }

  componentDidMount () {
    // attempt to set search parameters until google maps script loads
    this.setSearchOptsTimer = setInterval(() => {
      const { searchOpts } = this.state
      if (typeof window.google !== 'undefined') {
        this.setState({searchOpts: { location: new window.google.maps.LatLng(57.735725, 11.975619), radius: 80000 }}, () => { clearInterval(this.setSearchOptsTimer) })
      }
      if (searchOpts !== {}) {
        clearInterval(this.setSearchOptsTimer)
      }
    }, 650)
  }

  componentWillUnmount () {
    clearInterval(this.setSearchOptsTimer)
  }

handleChangeBreakStart = event => {
  const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
  if (valid) {
    this.setState({ breakstart: moment(event) })
    document.getElementsByClassName('break-start')[0].firstChild.style.color = 'black'
  } else {
    document.getElementsByClassName('break-start')[0].firstChild.style.color = 'red'
  }
}

handleChangeBreakEnd = event => {
  const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
  if (valid) {
    this.setState({ breakend: moment(event) })
    document.getElementsByClassName('break-end')[0].firstChild.style.color = 'black'
  } else {
    document.getElementsByClassName('break-end')[0].firstChild.style.color = 'red'
  }
}

  handleChangeStart = event => {
    const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
    if (valid) {
      this.setState({ start: moment(event) })
      document.getElementsByClassName('start-time-selector')[0].firstChild.style.color = 'black'
    } else {
      document.getElementsByClassName('start-time-selector')[0].firstChild.style.color = 'red'
    }
  }

  handleChangeEnd = event => {
    const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
    if (valid) {
      this.setState({ end: moment(event) })
      document.getElementsByClassName('end-time-selector')[0].firstChild.style.color = 'black'
    } else {
      document.getElementsByClassName('end-time-selector')[0].firstChild.style.color = 'red'
    }
  }

  handleTo = value => {
    this.setState({ toField: value }, () => {
      const { ...state } = this.state
      if (state.fromField !== '' && state.toField !== '') {
        this.getDistance(
          [state.fromField],
          [state.toField],
          window.google
        )
      }
    })
  }

  handleFrom = value => {
    this.setState({ fromField: value }, () => {
      const { ...state } = this.state
      if (state.fromField !== '' && state.toField !== '') {
        this.getDistance(
          [state.fromField],
          [state.toField],
          window.google
        )
      }
    })
  }

  getDistance = (origins, destinations, google, actionTrigger = 'NONE') => {
    const { ...state } = this.state
    const { ...props } = this.props
    const service = new google.maps.DistanceMatrixService()
    service.getDistanceMatrix(
      {
        origins: origins,
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        drivingOptions: {
          departureTime: new Date(state.start.toDate()),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      },
      (response, status) => {
        let newState = state
        console.log(newState)

        if (status === 'OK' && response.destinationAddresses[0] !== '' && response.originAddresses[0] !== '' && response.rows[0].elements[0].status !== 'ZERO_RESULTS') {
          // We use duration_in_traffic as default if normal time answer is longer we want to use that duration
          if (response.rows[0].elements[0].duration_in_traffic.value < response.rows[0].elements[0].duration.value) {
            response.rows[0].elements[0].duration_in_traffic = response.rows[0].elements[0].duration
          }
          /*
            BASIC SANITY CHECK FOR BUS SPEEDS
            Checks if average speed is above 90km/h on this trip and recalculated the google time result if it is
            Also processes legally mandated breaks and driving time
            2*4.5 hour is allowed per day with 45 min break
            Legal driving rules hardcoded in this version
          */
          const topavgtargetspeed = 90
          const km = response.rows[0].elements[0].distance.value / 1000
          const hour = response.rows[0].elements[0].duration_in_traffic.value / 3600
          if ((km / hour) > topavgtargetspeed) { // if average speed is above Xkm/h expand time
            response.rows[0].elements[0].duration_in_traffic.value = (3600 * km) / topavgtargetspeed // sets duration to Xkm/h average speed
            response.rows[0].elements[0].duration_in_traffic.text = durationToString(response.rows[0].elements[0].duration_in_traffic.value)
          }
          // Check driving times and breaks
          if (response.rows[0].elements[0].duration_in_traffic.value > 9 * 3600) {
            newState = {...newState, ...{'multidriver': true}}
          } else {
            newState = {...newState, ...{'multidriver': false}}
          }
          console.log(newState)

          if (response.rows[0].elements[0].duration_in_traffic.value > 4.25 * 3600) {
            newState = {...newState, ...{'break45': true}}
            response.rows[0].elements[0].duration_in_traffic.value = response.rows[0].elements[0].duration_in_traffic.value + (45 * 60)
            response.rows[0].elements[0].duration_in_traffic.text = durationToString(response.rows[0].elements[0].duration_in_traffic.value)
          } else {
            newState = {...newState, ...{'break45': false}}
          }
          console.log(newState)

          const start = state.start.clone()
          newState = {...newState,
            ...{end: start.add(response.rows[0].elements[0].duration_in_traffic.value, 's'),
              traffic: response.rows[0].elements[0].duration_in_traffic,
              km: response.rows[0].elements[0].distance
            }
          }
        } else {
          newState = {...newState,
            ...{traffic: null,
              km: null
            }
          }
        }
        console.log(newState)
        if (status === 'OK' && response.rows[0].elements[0].distance !== null && response.rows[0].elements[0].duration_in_traffic !== null) {
          newState = {...newState, ...{'showResult': true}}
        }

        this.setState(newState)
        console.log(newState)
        // Dispatch Action on response if from actionTrigger
        if (actionTrigger !== 'NONE' && response === 'OK') { props.addLeg(actionTrigger, Object.assign({}, newState)) }
      }
    )
  };

  render () {
    const { ...state } = this.state
    const { ...props } = this.props

    console.log('state: ', state)
    console.log('props: ', props)

console.log(state.searchOpts)
    return (

      <div className="planner">
        <h1>Planera uppdrag</h1>
        <label htmlFor="start-time">Starttid</label>
        <DateTime
          value={state.start}
          onChange={this.handleChangeStart}
          className="planner-datepicker start-time-selector"

        />
        <ReactDependentScript
          loadingComponent={
            <div style={{margin: '10px', fontSize: '1.5em'}}>
              Ansluter till Google Maps <FontAwesomeIcon icon={faSpinner} pulse />
            </div>
          }
          scripts={[
            'https://maps.googleapis.com/maps/api/js?key=' +
              config.mapsapiKey +
              '&libraries=places'
          ]}
        >
          <div className="planner-locations">
            <label htmlFor="from-address">Från adress</label>
            <SelectAddress
              handler={this.handleFrom}
              id="from-address"
              tab_index={1}
              options={state.searchOpts} />
            <label htmlFor="to-address">Till adress</label>
            <SelectAddress
              handler={this.handleTo}
              id="to-address"
              tab_index={2}
              options={state.searchOpts} />
          </div>
          <div className="planner-leg-results">
            <ShowPrelResults
              doesShow={state.showResult}
              traffic={state.traffic === null ? 'Hittades inte' : state.traffic.text}
              hasBreak={state.break45}
              km={state.km === null ? 'Hittades inte' : state.km.text} />
          </div>
          <div>
            <input type="checkbox" id="empty-leg" />
            <label htmlFor="empty-leg">Tomkörning</label>
          </div>
          <div className="planner-controls">

            <label htmlFor="end-time">Sluttid</label>
            <DateTime
              value={state.end}
              onChange={this.handleChangeEnd}
              className="planner-datepicker end-time-selector"
              id="end-time"
            />
            <p className={'planner-controls-time ' + (state.multidriver ? 'red' : '')}>
              {state.end !== null && state.end.isValid() ? 'Körtid: ' + moment.duration(state.end.diff(state.start)).asHours().toFixed(2) + ' timmar' : ''}
              {(state.end !== null && state.end.isValid()) && state.break45 ? ' (inkluderar 45 min rast)' : ''}
              {(state.end !== null && state.end.isValid()) && state.multidriver ? ' 2 förare krävs!' : ''}
            </p>
            <button
              onClick={() =>
                this.getDistance(
                  [state.fromField],
                  [state.toField],
                  window.google,
                  'TRIP'
                )
              }
            >
              Lägg till resan <FontAwesomeIcon icon={faAngleRight} />
            </button>
          </div>
        </ReactDependentScript>
        <div className="planner-break">
          <h3>Övrig tid (betald eller obetald)</h3>
          <label htmlFor="break-start">Starttid</label>
          <DateTime
            value={state.breakstart}
            onChange={this.handleChangeBreakStart}
            className="planner-datepicker break-start"
          />
          <label htmlFor="break-end">Sluttid</label>
          <DateTime
            value={state.breakend}
            onChange={this.handleChangeBreakEnd}
            className="planner-datepicker break-end"
          />
          <p style={{width: '130px', textAlign: 'left', margin: '7px auto 2px auto'}}>
            <input id="timeIsPaid" type="radio" name="isPaid" defaultChecked value="true" />
            <label htmlFor="timeIsPaid">Betald tid</label>
          </p>

          <p style={{width: '130px', textAlign: 'left', margin: '2px auto'}}>
            <input id="timeIsNotPaid" type="radio" name="isPaid" value="false" />
            <label htmlFor="timeIsNotPaid">Obetald tid</label>
          </p>
          <button
            onClick={() =>
              props.addLeg('BREAK', Object.assign({}, state))
            }
          >
            Lägg till tid i uppdraget <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </div>
        <div className="planner-options">
          <h3 style={{marginBottom: '10px'}}>Inställningar</h3>
          <p style={{width: '200px', textAlign: 'left', margin: '2px auto'}}>
            <input type="checkbox" id="less-then-30" />
            <label htmlFor="less-then-30">Under 30 personer</label>
          </p>
          <p style={{width: '200px', textAlign: 'left', margin: '2px auto'}}>
            <input type="checkbox" id="two-drivers" />
            <label htmlFor="two-drivers">Två förare</label>
          </p>
        </div>
      </div>

    )
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  addLeg
}, dispatch)

export default connect(null, mapDispatchToProps)(Planner)
