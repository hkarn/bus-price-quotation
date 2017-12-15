import moment from "moment";
import "moment/locale/sv";

import { durationToString } from '../functions'

export function addLeg(type, payloadIn) {

  switch(type){

    case 'TRIP':
      return addTrip(type, payloadIn)

    case 'BREAK':
      return addBreak(type, payloadIn)
 
    default:
      return {
        type: 'NONE',
        payload: null,
      }
  }
  
}

function addTrip(type, input) {
  if (input.toField !== "" && input.fromField !== "" && input.end.isValid() && input.start.isValid() && input.response === "OK") {
    const payload = {
      start: input.start,
      end: input.end,
      from: input.fromField,
      to: input.toField,
      km: input.km,
      duration: input.traffic,
      break: input.break45,
      codriver: input.multidriver,
      isbreak: false,
    }
    return {
      type: 'ADD_TRIP_' + type,
      payload: payload,
    }
  } else {
    return {
      type: 'NONE',
      payload: null,
    }
  }
  
}

function addBreak(type, input) {

  if (input.breakstart.isValid() && input.breakend.isValid()) {
    const duration = moment.duration(moment(input.breakend).diff(input.breakstart))
    if (duration.asMinutes() > 0) {
      const durationtext = durationToString(duration)
      const durationvalue = duration.asSeconds()

      const payload = {
        start: input.breakstart,
        end: input.breakend,
        isbreak: true,
        duration: {
          text: durationtext,
          value: durationvalue,
        },
      }
      return {
        type: 'ADD_TRIP_' + type,
        payload: payload,
      }
    }
  }
  return {
    type: 'NONE',
    payload: null,
  }
}
