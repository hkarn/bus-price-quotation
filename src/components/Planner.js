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
        <h1>Planera uppdrag</h1>
        <label htmlFor='start-time'>Starttid</label>
        <DateTime value={this.state.start} onChange={this.handleChangeStart} className='planner-datepicker' id='start-time'/>
        <ReactDependentScript
          loadingComponent={<div>Ansluter till Google Maps <FontAwesome name='spinner' spin/></div>}
          scripts={['https://maps.googleapis.com/maps/api/js?key=' + config.mapsapiKey + '&libraries=places']}
        >
          <div className="planner-locations">
          
            <label htmlFor='from-address'>Från adress</label>
            <PlacesAutocomplete inputProps={inputPropsTo} styles={addressStyle} id='from-address'/>
            <label htmlFor='to-address'>Till adress</label>
            <PlacesAutocomplete inputProps={inputPropsFrom} styles={addressStyle} id='to-address'/>
          
          <input type="checkbox" id='empty-leg' /><label htmlFor='empty-leg'>Tomkörning</label>
          </div>
          <div className="planner-controls">
            <button onClick={() => this.getDistance([this.state.fromField], [this.state.toField], window.google)}> Lägg till resan <FontAwesome name='chevron-right' /> </button>
            <label htmlFor='end-time'>Manuell sluttid</label>
          <DateTime value={this.state.end} onChange={this.handleChangeEnd} className='planner-datepicker' id='end-time' />
          </div>
        </ReactDependentScript>
        <div className="planner-leg-results">
        </div>
        
        <div className="planner-break">
        <h3>Rast/Avbrott</h3>
        <label htmlFor='break-start'>Avbrott starttid</label>
        <DateTime value={this.state.breakstart} onChange={this.handleChangeBreakStart} className='planner-datepicker' id='break-start' />
        <label htmlFor='break-end'>Avbrott sluttid</label>
        <DateTime value={this.state.breakend} onChange={this.handleChangeBreakStart} className='planner-datepicker' id='break-end' />
          <button> Lägg till obetald tid i uppdraget <FontAwesome name='chevron-right' /> </button>
        </div>
        <div className="planner-options">
        <h3>Inställningar</h3>
          <input type="checkbox" id='less-then-30'/><label htmlFor='less-then-30'>Under 30 personer</label><br />
          <input type="checkbox" id='two-drivers' /><label htmlFor='two-drivers'>Två förare</label>
        </div>
      </div>
    );

  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  
}, dispatch)

export default connect(null, mapDispatchToProps)(Planner);