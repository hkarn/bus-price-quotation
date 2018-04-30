export default function trips (state = [], action) {
  switch (action.type) {
    case 'ADD_TRIP_TRIP':
      return [...state, action.payload]

    case 'ADD_TRIP_BREAK':
      return [...state, action.payload]

    case 'REMOVE_TRIP':
      console.log(state)
      console.log(action.payload)
      const index = state.findIndex(trip => trip.index === action.payload)
      console.log(index)
      const newState = [...state]
      console.log(newState)
      newState.splice(index, 1)
      console.log(newState)
      return newState

    default:
      return state
  }
}
