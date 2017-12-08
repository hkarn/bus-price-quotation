import React, { Component } from 'react';
import { bindActionCreators }from 'redux'
import { connect } from 'react-redux'

import ReactDependentScript from 'react-dependent-script';
import PlacesAutocomplete/*, { geocodeByAddress, getLatLng }*/ from 'react-places-autocomplete'
import DateTime from 'react-datetime'
import FontAwesome from 'react-fontawesome'

import config from '../config/config.js'

import moment from "moment";
import 'moment/locale/sv';

import '../styles/react-datetime.css'
import '../styles/component-styles/Planner.css'
import addressStyle from '../styles/adressFormStyles'

moment.locale("sv");


class Planner extends Component {
  
    state = { 
      start: moment(),
      end: null,
      breakstart: moment(),
      breakend: moment(),
      fromField: "",
      toField: "",
    }

   
  handleChangeStart = (event) => {
    this.setState({start: event});

  }

  handleChangeEnd = (event) => {
    this.setState({end: event});

  }
  
  
  onChangeFrom = (fromField) => this.setState({ fromField })
  onChangeTo = (toField) => this.setState({ toField })

  getDistance = (origins, destinations, google) => {
    const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
          origins: origins,
          destinations: destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
          drivingOptions: {
            departureTime: new Date(Date.now()),  
            trafficModel: google.maps.TrafficModel.PESSIMISTIC
          }
          
      }, (response, status) => {
        console.log(response)
        console.log(status)
          console.log(response.rows[0].elements[0].distance)
          console.log(response.rows[0].elements[0].duration)
          console.log(response.rows[0].elements[0].duration_in_traffic)
          
          this.setState({response: response.rows[0].elements[0]})
      });

 
    }

  
  render() {

    

    
    const inputPropsFrom = {
      value: this.state.fromField,
      onChange: this.onChangeFrom
    }
    
    const inputPropsTo = {
      value: this.state.toField,
      onChange: this.onChangeTo
    }

    return (
      <div className="planner"> 
        <label>Starttid</label>
        <DateTime value={this.state.start} onChange={this.handleChangeStart} className="planner-datepicker"/>
        <ReactDependentScript
          loadingComponent={<div>Ansluter till Google Maps <FontAwesome name='spinner' spin/></div>}
          scripts={['https://maps.googleapis.com/maps/api/js?key=' + config.mapsapiKey + '&libraries=places']}
        >
          <div className="planner-locations">
          
            <label>Från adress</label>
            <PlacesAutocomplete inputProps={inputPropsTo} styles={addressStyle}/>
            <label>Till adress</label>
            <PlacesAutocomplete inputProps={inputPropsFrom} styles={addressStyle} />
          
          <input type="checkbox" /><label>TOMMIL</label>
          </div>
          <div className="planner-controls">
            <button onClick={() => this.getDistance([this.state.fromField], [this.state.toField], window.google)}> Lägg till resan <FontAwesome name='chevron-right' /> </button>
            <button> Lägg till automatisk returresa <FontAwesome name='chevron-right' /> </button>
            <label>Sluttid</label>
          <DateTime value={this.state.end} onChange={this.handleChangeEnd} className="planner-datepicker"/>
          </div>
        </ReactDependentScript>
        <div className="planner-leg-results">
        </div>
        
        <div className="planner-break">
        <h3>Rast/Avbrott</h3>
        <label>Avbrott starttid</label>
        <DateTime value={this.state.breakstart} onChange={this.handleChangeBreakStart} className="planner-datepicker"/>
        <label>Avbrott sluttid</label>
        <DateTime value={this.state.breakend} onChange={this.handleChangeBreakStart} className="planner-datepicker"/>
          <button> Lägg till obetald tid i uppdraget <FontAwesome name='chevron-right' /> </button>
        </div>
        <div className="planner-options">
        <h3>Inställningar</h3>
          <input type="checkbox" /><label>Under 30 personer</label><br />
          <input type="checkbox" /><label>Två förare</label>
        </div>
      </div>
    );

  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  
}, dispatch)

export default connect(null, mapDispatchToProps)(Planner);