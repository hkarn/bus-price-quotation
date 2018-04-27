import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
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
      drive: {
        start: moment().add(6, 'hours'),
        end: null,
        fromField: '',
        toField: '',
        km: null,
        traffic: null,
        multidriver: false,
        break45: false,
        empty: false,
        index: props.index
      },
      other: {
        start: moment().add(6, 'hours'),
        end: moment().add(6, 'hours'),
        isPaid: true,
        index: props.index
      },
      hasTwoDrivers: false,
      smallGroupDiscount: false,
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
        this.setState({searchOpts: { location: new window.google.maps.LatLng(57.735725, 11.975619), radius: 65000 }}, () => { clearInterval(this.setSearchOptsTimer) })
      }
      if (searchOpts !== {}) {
        clearInterval(this.setSearchOptsTimer)
      }
    }, 650)
  }

  componentWillReceiveProps(nextProps) {
    const {...state} = this.state
    const newDrive = state.drive
    const newOther = state.other
    const tmp = nextProps.index.toString() + moment().format('x').toString()
    newDrive.index = tmp
    newOther.index = tmp
    this.setState(prevState => {
      prevState.drive = newDrive
      prevState.other = newOther
      return prevState
    })
  }

  componentWillUnmount () {
    clearInterval(this.setSearchOptsTimer)
  }

handleChangeBreakStart = event => {
  const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
  if (valid) {
    const {...state} = this.state
    let newOther = state.other
    newOther = {...newOther, ...{start: moment(event)}}
    this.setState({ other: newOther })
    document.getElementsByClassName('break-start')[0].firstChild.style.color = 'black'
  } else {
    document.getElementsByClassName('break-start')[0].firstChild.style.color = 'red'
  }
}

handleChangeBreakEnd = event => {
  const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
  if (valid) {
    const {...state} = this.state
    let newOther = state.other
    newOther = {...newOther, ...{end: moment(event)}}
    this.setState({ other: newOther })
    document.getElementsByClassName('break-end')[0].firstChild.style.color = 'black'
  } else {
    document.getElementsByClassName('break-end')[0].firstChild.style.color = 'red'
  }
}

  handleChangeStart = event => {
    const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
    if (valid) {
      const {...state} = this.state
      let newDrive = state.drive
      newDrive = {...newDrive, ...{start: moment(event)}}
      this.setState({ drive: newDrive }, () => {
        const { ...state } = this.state
        if (state.drive.fromField !== '' && state.drive.toField !== '') {
          this.getDistance(
            [state.drive.fromField],
            [state.drive.toField],
            window.google
          )
        }
      })
      document.getElementsByClassName('start-time-selector')[0].firstChild.style.color = 'black'
    } else {
      document.getElementsByClassName('start-time-selector')[0].firstChild.style.color = 'red'
    }
  }

  handleChangeEnd = event => {
    const valid = !!moment(event, 'YYYY-MM-DD HH:mm', true).isValid()
    if (valid) {
      const {...state} = this.state
      let newDrive = state.drive
      newDrive = {...newDrive, ...{end: moment(event)}}
      this.setState({ drive: newDrive })
      document.getElementsByClassName('end-time-selector')[0].firstChild.style.color = 'black'
    } else {
      document.getElementsByClassName('end-time-selector')[0].firstChild.style.color = 'red'
    }
  }

  handleTo = value => {
    const {...state} = this.state
    let newDrive = state.drive
    newDrive = {...newDrive, ...{toField: value}}
    this.setState({ drive: newDrive }, () => {
      const { ...state } = this.state
      if (state.drive.fromField !== '' && state.drive.toField !== '') {
        this.getDistance(
          [state.drive.fromField],
          [state.drive.toField],
          window.google
        )
      }
    })
  }

  handleFrom = value => {
    const {...state} = this.state
    let newDrive = state.drive
    newDrive = {...newDrive, ...{fromField: value}}
    this.setState({ drive: newDrive }, () => {
      const { ...state } = this.state
      if (state.drive.fromField !== '' && state.drive.toField !== '') {
        this.getDistance(
          [state.drive.fromField],
          [state.drive.toField],
          window.google
        )
      }
    })
  }

  handleChangeisPaidBreak = e => {
    const { ...state } = this.state
    const newOther = Object.assign({}, state.other)
    newOther.isPaid = e.target.value === 'yes'
    this.setState({other: newOther})
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
          departureTime: new Date(state.drive.start.toDate()),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      },
      (response, status) => {
        let newState = state
        let newDrive = newState.drive

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
            newDrive = {...newDrive, ...{'multidriver': true}}
          } else {
            newDrive = {...newDrive, ...{'multidriver': false}}
          }

          if (response.rows[0].elements[0].duration_in_traffic.value > 4.25 * 3600) {
            newDrive = {...newDrive, ...{'break45': true}}
            response.rows[0].elements[0].duration_in_traffic.value = response.rows[0].elements[0].duration_in_traffic.value + (45 * 60)
            response.rows[0].elements[0].duration_in_traffic.text = durationToString(response.rows[0].elements[0].duration_in_traffic.value)
          } else {
            newDrive = {...newDrive, ...{'break45': false}}
          }

          const start = newDrive.start.clone()
          newDrive = {...newDrive,
            ...{end: start.add(response.rows[0].elements[0].duration_in_traffic.value, 's'),
              traffic: response.rows[0].elements[0].duration_in_traffic,
              km: response.rows[0].elements[0].distance
            }
          }
        } else {
          newDrive = {...newDrive,
            ...{traffic: null,
              km: null
            }
          }
        }
        if (status === 'OK' && response.rows[0].elements[0].distance !== null && response.rows[0].elements[0].duration_in_traffic !== null) {
          this.setState({'showResult': true})
        }

        this.setState({drive: newDrive})
        // Dispatch Action on response if from actionTrigger
        if (actionTrigger !== 'NONE' && status === 'OK') {
          props.addLeg(actionTrigger, Object.assign({}, newDrive))
        }
      }
    )
  };

  render () {
    const { ...state } = this.state
    const { ...props } = this.props

    return (

      <div className="planner">
        <h1>Planera uppdrag</h1>
        <label htmlFor="start-time">Starttid</label>
        <DateTime
          value={state.drive.start}
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
              traffic={state.drive.traffic === null ? 'Hittades inte' : state.drive.traffic.text}
              hasBreak={state.drive.break45}
              km={state.drive.km === null ? 'Hittades inte' : state.drive.km.text} />
          </div>
          <div>
            <input type="checkbox" id="empty-leg" name="empty-leg" checked={state.drive.empty} onChange={e => {
              const {...state} = this.state
              let newDrive = Object.assign({}, state.drive)
              newDrive = {...newDrive, ...{empty: e.target.checked}}
              this.setState({drive: newDrive})
            }} />
            <label htmlFor="empty-leg">Tomkörning</label>
          </div>
          <div className="planner-controls">

            <label htmlFor="end-time">Sluttid</label>
            <DateTime
              value={state.drive.end}
              onChange={this.handleChangeEnd}
              className="planner-datepicker end-time-selector"
              id="end-time"
            />
            <p className={'planner-controls-time ' + (state.drive.multidriver ? 'red' : '')}>
              {state.drive.end !== null && state.drive.end.isValid() ? 'Körtid: ' + moment.duration(state.drive.end.diff(state.drive.start)).asHours().toFixed(2) + ' timmar' : ''}
              {(state.drive.end !== null && state.drive.end.isValid()) && state.drive.break45 ? ' (inkluderar 45 min rast)' : ''}
              {(state.drive.end !== null && state.drive.end.isValid()) && state.drive.multidriver ? ' 2 förare krävs!' : ''}
            </p>
            <button
              onClick={() =>
                this.getDistance(
                  [state.drive.fromField],
                  [state.drive.toField],
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
            value={state.other.start}
            onChange={this.handleChangeBreakStart}
            className="planner-datepicker break-start"
          />
          <label htmlFor="break-end">Sluttid</label>
          <DateTime
            value={state.other.end}
            onChange={this.handleChangeBreakEnd}
            className="planner-datepicker break-end"
          />
          <p style={{width: '130px', textAlign: 'left', margin: '7px auto 2px auto'}}>
            <input id="timeIsPaid" type="radio" name="isPaid" checked={state.other.isPaid} value="yes" onChange={this.handleChangeisPaidBreak} />
            <label htmlFor="timeIsPaid">Betald tid</label>
          </p>

          <p style={{width: '130px', textAlign: 'left', margin: '2px auto'}}>
            <input id="timeIsNotPaid" type="radio" name="isPaid" checked={!state.other.isPaid} value="no" onChange={this.handleChangeisPaidBreak} />
            <label htmlFor="timeIsNotPaid">Obetald tid</label>
          </p>
          <button
            onClick={() =>
              props.addLeg('BREAK', Object.assign({}, state.other))
            }
          >
            Lägg till tid i uppdraget <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </div>
        <div className="planner-options">
          <h3 style={{marginBottom: '10px'}}>Inställningar</h3>
          <p style={{width: '200px', textAlign: 'left', margin: '2px auto'}}>
            <input type="checkbox" id="less-then-30" name="smallGroupDiscount" checked={state.smallGroupDiscount} onChange={e => { this.setState({smallGroupDiscount: e.target.checked}) }} />
            <label htmlFor="less-then-30">Under 30 personer</label>
          </p>
          <p style={{width: '200px', textAlign: 'left', margin: '2px auto'}}>
            <input type="checkbox" id="two-drivers" name="hasTwoDrivers" checked={state.hasTwoDrivers} onChange={e => { this.setState({hasTwoDrivers: e.target.checked}) }} />
            <label htmlFor="two-drivers">Två förare</label>
          </p>
        </div>
      </div>

    )
  }
}

Planner.propTypes = {
  index: PropTypes.number
}

const mapDispatchToProps = dispatch => bindActionCreators({
  addLeg
}, dispatch)

const mapStateToProps = (state) => {
  return {
    index: state.trips.length
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Planner)
