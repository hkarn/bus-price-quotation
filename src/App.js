import React, { Component } from 'react';
import logo from './logo.svg';
import './scss/css/App.css';
import Autocomplete from 'react-google-autocomplete';

class App extends Component {
  
  state = {loaded: false}

  onPlaceSelected() {
    console.log("selected")
  }

  componentDidMount() {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBn5jU3NE8VcLZPbOSV-BuG3a6Ainz6LQA&libraries=places";
    script.async = true
    script.onload = () => {
      this.setState({loaded: true})
        
      }
      
    
    document.body.appendChild(script);
  }
  
  
  
  
  render() {

    let auto = null;
    if (this.state.loaded) {
      auto = <Autocomplete
        style={{width: '90%'}}
        onPlaceSelected={(place) => {
        console.log(place);}}
      />;
    } else {
      auto = "Hello Not loaded yet";
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
        {auto}
    
      
      </div>
    );
  }
}

export default App;
