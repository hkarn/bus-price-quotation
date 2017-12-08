

class AddLeg extends Component {
/*
  constructor(props) {
    super(props)
    this.state = { from: "",
    to: "",
    destinations: [],
    origins: [],
    response: null,
    prices: null
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

  handleChange = (event) => {
    const datetime = new Date(Date.parse(event.target.value))
    this.setState({value: datetime});
  }

const inputPropsFrom = {
  value: this.state.from,
  onChange: this.onChangeFrom
}
const inputPropsTo = {
  value: this.state.to,
  onChange: this.onChangeTo
}



<h1>Prisräknare</h1>
        <div>
        <h2>Körningar</h2>
        <ReactDependentScript
          loadingComponent={<div>Ansluter till Google Maps ...</div>}
          scripts={['https://maps.googleapis.com/maps/api/js?key=' + config.mapsapiKey + '&libraries=places']}
        >
          <PlacesAutocomplete inputProps={inputPropsTo} styles={defaultStyles}/>
          <PlacesAutocomplete inputProps={inputPropsFrom} styles={defaultStyles} />
        </ReactDependentScript>


        <p>Datum-Tid Avresa denna körning:<input type="datetime-local" value={this.state.datetime} onChange={this.handleChange} /></p>
        <button>+ Lägg till körning</button>
        <br />
        <button>+ Lägg till automatisk hemresa</button>
        </div>
        <div className="results">
          <h2>Resultat</h2>
        </div>
        <div className="uppdrag">
          <h2>Uppdrag</h2>
        </div>*/
}