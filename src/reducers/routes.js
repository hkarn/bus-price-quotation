export default function prices (state = [], action) {
  switch (action.type) {
    case 'ADD_ROUTE':
      return [...state, action.payload]

    default:
      return state
  }
}
