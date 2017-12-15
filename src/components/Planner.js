import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import ReactDependentScript from "react-dependent-script";
import PlacesAutocomplete /*, { geocodeByAddress, getLatLng }*/ from "react-places-autocomplete";
import DateTime from "react-datetime";
import FontAwesome from "react-fontawesome";

import config from "../config/config.js";

import {addLeg, toggleSetting} from '../actions'

import moment from "moment";
import "moment/locale/sv";

import "../styles/react-datetime.css";
import "../styles/component-styles/Planner.css";
import addressStyle from "../styles/adressFormStyles";

import ShowPrelResults from "./ShowPrelResults"

import { durationToString } from '../functions'

moment.locale("sv");

class Planner extends Component {

  


  state = {
    start: moment(),
    end: null,
    breakstart: moment(),
    breakend: moment(),
    fromField: "",
    toField: "",
    km: null,
    traffic: null,
    response: null,
    break45: false,       //45 min break included in time (all durations above 4.5 hours)
    multidriver: false,
  }



handleChangeBreakStart = event => {
  const valid = moment(event,"YYYY-MM-DD HH:mm", true).isValid() ? true : false
  if (valid) {
    this.setState({ breakstart: moment(event) })
    document.getElementsByClassName('break-start')[0].firstChild.style.color = 'black'
  } else {
    document.getElementsByClassName('break-start')[0].firstChild.style.color = 'red'
  }
}

handleChangeBreakEnd = event => {
  const valid = moment(event,"YYYY-MM-DD HH:mm", true).isValid() ? true : false
  if (valid) {
    this.setState({ breakend: moment(event) })
    document.getElementsByClassName('break-end')[0].firstChild.style.color = 'black'
  }  else {
    document.getElementsByClassName('break-end')[0].firstChild.style.color = 'red'   
  }
}

  handleChangeStart = event => {
    const valid = moment(event,"YYYY-MM-DD HH:mm", true).isValid() ? true : false
    if (valid) {
      this.setState({ start: moment(event) })
      document.getElementsByClassName('start-time-selector')[0].firstChild.style.color = 'black'
    } else {
      document.getElementsByClassName('start-time-selector')[0].firstChild.style.color = 'red'
    }
  }

  handleChangeEnd = event => {
    const valid = moment(event,"YYYY-MM-DD HH:mm", true).isValid() ? true : false
    if (valid) {
      this.setState({ end: moment(event) })
      document.getElementsByClassName('end-time-selector')[0].firstChild.style.color = 'black'
    }  else {
      document.getElementsByClassName('end-time-selector')[0].firstChild.style.color = 'red'   
    }
  }

  onChangeFrom = fromField => {
    this.setState({ fromField: fromField })
    if (this.state.fromField !== "" && this.state.toField !== "") {
      this.getDistance(
        [this.state.fromField],
        [this.state.toField],
        window.google
      )
    }
  }

  onBlurFrom = event => {
    this.setState({ fromField: event.target.value })
    if (this.state.fromField !== "" && this.state.toField !== "" && event.target.value !== "") {
      this.getDistance(
        [this.state.fromField],
        [this.state.toField],
        window.google
      )
    }
  }


  onChangeTo = toField => {
    this.setState({ toField: toField })
    if (this.state.fromField !== "" && this.state.toField !== "") {
      this.getDistance(
        [this.state.fromField],
        [this.state.toField],
        window.google
      )
    }
  }

  onBlurTo = event => {
    this.setState({ toField: event.target.value })
    if (this.state.fromField !== "" && this.state.toField !== "" && event.target.value !== "") {
      this.getDistance(
        [this.state.fromField],
        [this.state.toField],
        window.google
      )
    }
  }

  getDistance = (origins, destinations, google, actionTrigger='NONE') => {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: origins,
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        drivingOptions: {
          departureTime: new Date(this.state.start.toDate()),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      },
      (response, status) => {
        console.log(response)
        console.log(status)
        if (status === "OK" && response.destinationAddresses[0] !== "" && response.originAddresses[0] !== "" && response.rows[0].elements[0].status !== "ZERO_RESULTS") {
          //We use duration_in_traffic as default if normal time answer is longer we want to use that duration
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
          const km = response.rows[0].elements[0].distance.value/1000
          const hour = response.rows[0].elements[0].duration_in_traffic.value/3600
          if ((km/hour) > topavgtargetspeed) { //if average speed is above Xkm/h expand time
            response.rows[0].elements[0].duration_in_traffic.value = ((3600*km)/(topavgtargetspeed)) //sets duration to Xkm/h average speed
            response.rows[0].elements[0].duration_in_traffic.text = durationToString(response.rows[0].elements[0].duration_in_traffic.value)
          }
          //Check driving times and breaks
          if (response.rows[0].elements[0].duration_in_traffic.value > 9*3600) {
            this.setState({'multidriver': true})
          } else {
            this.setState({'multidriver': false})
          }

          if (response.rows[0].elements[0].duration_in_traffic.value > 4.25*3600) {
            this.setState({'break45': true})    
            response.rows[0].elements[0].duration_in_traffic.value = response.rows[0].elements[0].duration_in_traffic.value + (45*60)
            response.rows[0].elements[0].duration_in_traffic.text = durationToString(response.rows[0].elements[0].duration_in_traffic.value)
          } else {
            this.setState({'break45': false})  
          }

          let start = this.state.start.clone();
          this.setState({ end: start.add(response.rows[0].elements[0].duration_in_traffic.value, 's') })
          this.setState({ traffic: response.rows[0].elements[0].duration_in_traffic })
          this.setState({ km: response.rows[0].elements[0].distance })
          this.setState({ response: status })
        } else {
          this.setState({ response: "Ingen rutt hittad" })
        }

        if (this.state.response === "OK" && this.state.km !== null && this.state.no_traffic !== null && this.state.traffic !== null) {
          this.setState({'showResult':true})
        }
        //Dispatch Action on response
        if (actionTrigger !== 'NONE' && this.state.response === "OK")
          this.props.addLeg(actionTrigger, Object.assign({}, this.state))

      }
    );
  };

  render() {
    const inputPropsFrom = {
      value: this.state.fromField,
      onChange: this.onChangeFrom,
      onBlur: this.onBlurFrom,
    };

    const inputPropsTo = {
      value: this.state.toField,
      onChange: this.onChangeTo,
      onBlur: this.onBlurTo,
    };

    


    

    return (
      <div className="planner">
        <h1>Planera uppdrag</h1>
        <label htmlFor="start-time">Starttid</label>
        <DateTime
          value={this.state.start}
          onChange={this.handleChangeStart}
          className="planner-datepicker start-time-selector"
          
        />
        <ReactDependentScript
          loadingComponent={
            <div>
              Ansluter till Google Maps <FontAwesome name="spinner" spin />
            </div>
          }
          scripts={[
            "https://maps.googleapis.com/maps/api/js?key=" +
              config.mapsapiKey +
              "&libraries=places"
          ]}
        >
          <div className="planner-locations">
            <label htmlFor="from-address">Från adress</label>
            <PlacesAutocomplete
              inputProps={inputPropsFrom}
              styles={addressStyle}
              id="from-address"
              tabindex="1"
            />
            <label htmlFor="to-address">Till adress</label>
            <PlacesAutocomplete
              inputProps={inputPropsTo}
              styles={addressStyle}
              id="to-address"
              tabindex="2"
            />
          </div>
          <div className="planner-leg-results">
            <ShowPrelResults 
              doesShow={this.state.showResult} 
              traffic={this.state.traffic === null ? "Hittades inte" : this.state.traffic.text} 
              break={this.state.break45} 
              km={this.state.km === null ? "Hittades inte" : this.state.km.text}/>
          </div>
          <div>
            <input type="checkbox" id="empty-leg" />
            <label htmlFor="empty-leg">Tomkörning</label>
          </div>
          <div className="planner-controls">
            
            <label htmlFor="end-time">Sluttid</label>
            <DateTime
              value={this.state.end}
              onChange={this.handleChangeEnd}
              className="planner-datepicker end-time-selector"
              id="end-time"
            />
            <p className={'planner-controls-time ' + (this.state.multidriver ? 'red' : '') }>
              {(this.state.end !== null && this.state.end.isValid()) ? "Körtid: " + moment.duration(this.state.end.diff(this.state.start)).asHours().toFixed(2) + " timmar" : ""}
              {(this.state.end !== null && this.state.end.isValid()) && this.state.break45 ? " (inkluderar 45 min rast)" : ""}
              {(this.state.end !== null && this.state.end.isValid()) && this.state.multidriver ? " 2 förare krävs!" : ""}
              </p>
            <button
              onClick={() =>
                this.getDistance(
                  [this.state.fromField],
                  [this.state.toField],
                  window.google,
                  'TRIP'
                )
              }
            >
              Lägg till resan <FontAwesome name="chevron-right" />
            </button>
          </div>
        </ReactDependentScript>
        <div className="planner-break">
          <h3>Rast/Avbrott</h3>
          <label htmlFor="break-start">Avbrott starttid</label>
          <DateTime
            value={this.state.breakstart}
            onChange={this.handleChangeBreakStart}
            className="planner-datepicker break-start"
          />
          <label htmlFor="break-end">Avbrott sluttid</label>
          <DateTime
            value={this.state.breakend}
            onChange={this.handleChangeBreakEnd}
            className="planner-datepicker break-end"
          />
          <button
              onClick={() =>
                this.props.addLeg('BREAK', Object.assign({}, this.state))
              }
            >
            Lägg till obetald tid i uppdraget
            <FontAwesome name="chevron-right" />
          </button>
        </div>
        <div className="planner-options">
          <h3>Inställningar</h3>
          <input type="checkbox" id="less-then-30" />
          <label htmlFor="less-then-30">Under 30 personer</label>
          <br />
          <input type="checkbox" id="two-drivers" />
          <label htmlFor="two-drivers">Två förare</label>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  addLeg
}, dispatch)

export default connect(null, mapDispatchToProps)(Planner);



