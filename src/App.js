import React, { Component } from 'react';
import logo from './logo.svg';
import './scss/css/App.css';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import config from './config/config.js';
import firebase from './config/firebase.js';

//import Autocomplete from 'react-places-autocomplete';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = { from: 'Aröds Industriväg',
    to: "",
    loaded: false,
    destinations: [],
    origins: [],
    response: null
  }
    this.onChangeFrom = (from) => this.setState({ from })
    this.onChangeTo = (to) => this.setState({ to })
  }
  
  
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



  



  componentDidMount() {
    console.log()
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + config.mapsapiKey + "&libraries=places";
    script.async = true
    script.onload = () => {
      this.setState({loaded: true})
        
      }    
    document.body.appendChild(script);

    firebase.database().ref("prices/km")
      .once('value', function(snapshot){
        console.log(snapshot.val())}    
    )
    firebase.database().ref("prices/hours1")
    .once('value', function(snapshot){
      console.log(snapshot.val())}    
  )
  firebase.database().ref("prices/hours2")
  .once('value', function(snapshot){
    console.log(snapshot.val())}    
)
firebase.database().ref("prices/hours3")
.once('value', function(snapshot){
  console.log(snapshot.val())}    
)
firebase.database().ref("prices/hours4")
.once('value', function(snapshot){
  console.log(snapshot.val())}    
)

  }
  
  
  handleChange = (event) => {
    const datetime = new Date(Date.parse(event.target.value))
    this.setState({value: datetime});
  }
  
  render() {
/*
    let auto = null;
    if (this.state.loaded) {
      auto = <Autocomplete
        style={{width: '90%'}}
        onPlaceSelected={(place) => {
        console.log(place.formatted_address);
        this.setState({origins: [...this.state.origins, place.formatted_address]})
        }}
      />;
    } else {
      auto = "Hello Not loaded yet";
    }
    let auto2 = null;
    if (this.state.loaded) {
      auto2 = <Autocomplete
        style={{width: '90%'}}
        onPlaceSelected={(place) => {
        console.log(place.formatted_address);
        this.setState({destinations: [...this.state.destinations, place.formatted_address]})
        }}
      />;
    } else {
      auto2 = "Hello Not loaded yet";
    }
*/

const inputPropsFrom = {
  value: this.state.from,
  onChange: this.onChangeFrom
}
const inputPropsTo = {
  value: this.state.to,
  onChange: this.onChangeTo
}


    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {this.state.loaded ? <PlacesAutocomplete  inputProps={inputPropsFrom} /> : ""}
        {this.state.loaded ? <PlacesAutocomplete  inputProps={inputPropsTo} /> : ""}
        <p>Datum-Tid:<input type="datetime-local" value={this.state.datetime} onChange={this.handleChange} /></p>
        <button onClick={() => {
          console.log(this.state.from);
          console.log(this.state.to);
          this.getDistance([this.state.from], [this.state.to], window.google)
          }}>Starta</button>
          
      <div><p>Svar:</p></div>

        <p>{this.state.response !== null ? this.state.response.distance.text : ''}</p>
        <p>{this.state.response !== null ? this.state.response.duration.text : ''}</p>
        <p>In traffic: {this.state.response !== null ? this.state.response.duration_in_traffic.text : ''}</p>
      
        <p>Kilometerpris: {this.state.response !== null ? this.state.response.distance.value/1000 * 10 : 0}</p>
        <p>Timpris: {this.state.response !== null ? this.state.response.distance.value/1000 * 10 : 0}</p>
        <p>Totalpris: {this.state.response !== null ? this.state.response.distance.value/1000 * 10 : 0}</p>
      </div>
    );
  }
}

export default App;
