export default function trips(state = {}, action) {
  switch(action.type){
    case "ADD_TRIP_TRIP":
      return action.payload

    case "ADD_TRIP_BREAK":
      return action.payload
    
    default:
      return state

  }
}