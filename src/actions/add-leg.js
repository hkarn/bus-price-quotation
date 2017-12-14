
export function addLeg(type, payload) {
  return {
    type: type,
    payload: 'ADD_TRIP_'+payload,
  }
}
