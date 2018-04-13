export default function prices (state = {}, action) {
  switch (action.type) {
    case 'IMPORT_PRICES':
      return action.payload

    default:
      return state
  }
}
