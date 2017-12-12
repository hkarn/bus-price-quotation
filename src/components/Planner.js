import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import ReactDependentScript from "react-dependent-script";
import PlacesAutocomplete /*, { geocodeByAddress, getLatLng }*/ from "react-places-autocomplete";
import DateTime from "react-datetime";
import FontAwesome from "react-fontawesome";

import config from "../config/config.js";

import moment from "moment";
import "moment/locale/sv";

import "../styles/react-datetime.css";
import "../styles/component-styles/Planner.css";
import addressStyle from "../styles/adressFormStyles";

import ShowPrelResults from "./ShowPrelResults"

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
    no_traffic: null,
    traffic: null,
    response: null,
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

  getDistance = (origins, destinations, google) => {
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
          trafficModel: google.maps.TrafficModel.PESSIMISTIC
        }
      },
      (response, status) => {
        console.log(response)
        console.log(status)
        if (status === "OK" && response.destinationAddresses[0] !== "" && response.originAddresses[0] !== "" && response.rows[0].elements[0].status !== "ZERO_RESULTS") {
          let start = this.state.start.clone();
          this.setState({ end: start.add(response.rows[0].elements[0].duration_in_traffic.value, 's') })
          this.setState({ no_traffic: response.rows[0].elements[0].duration })
          this.setState({ traffic: response.rows[0].elements[0].duration_in_traffic })
          this.setState({ km: response.rows[0].elements[0].distance })
          this.setState({ response: status })
        } else {
          this.setState({ response: "Ingen rutt hittad" })
        }
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


    let showResult = false
    if (this.state.response === "OK" && this.state.km !== null && this.state.no_traffic !== null && this.state.traffic !== null) {
      showResult = true
    }


    

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
              doesShow={showResult} 
              no_traffic={this.state.no_traffic === null ? "Hittades inte" : this.state.no_traffic.text} 
              traffic={this.state.traffic === null ? "Hittades inte" : this.state.traffic.text} 
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
            <p className='planner-controls-time'>{(this.state.end !== null && this.state.end.isValid()) ? "Körtid: " + moment.duration(this.state.end.diff(this.state.start)).asHours().toFixed(2) + " timmar" : ""}</p>
            <button
              onClick={() =>
                this.getDistance(
                  [this.state.fromField],
                  [this.state.toField],
                  window.google
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
            className="planner-datepicker"
            id="break-start"
          />
          <label htmlFor="break-end">Avbrott sluttid</label>
          <DateTime
            value={this.state.breakend}
            onChange={this.handleChangeBreakStart}
            className="planner-datepicker"
            id="break-end"
          />
          <button>
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

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(null, mapDispatchToProps)(Planner);
