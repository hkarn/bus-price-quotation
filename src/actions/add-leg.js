import moment from 'moment'
import 'moment/locale/sv'

import { durationToString } from '../functions'

export function addLeg (type, payloadIn) {
  switch (type) {
    case 'TRIP':
      return addTrip(type, payloadIn)

    case 'BREAK':
      return addBreak(type, payloadIn)

    default:
      return {
        type: 'NONE',
        payload: null
      }
  }
}

function addTrip (type, input) {
  if (input.toField !== '' && input.fromField !== '' && input.end !== null && input.start !== null && input.end.isValid() && input.start.isValid()) {
    const payload = {
      type: 'drive',
      start: input.start,
      end: input.end,
      from: input.fromField,
      to: input.toField,
      km: input.km,
      duration: input.traffic,
      break: input.break45,
      codriver: input.multidriver,
      index: input.index
    }
    return {
      type: 'ADD_TRIP_' + type,
      payload: payload
    }
  } else {
    return {
      type: 'NONE',
      payload: null
    }
  }
}

function addBreak (type, input) {
  if (input.end !== null && input.start !== null && input.start.isValid() && input.end.isValid()) {
    const duration = moment.duration(moment(input.end).diff(input.start))
    if (duration.asMinutes() > 0) {
      const durationtext = durationToString(duration.asSeconds())
      const durationvalue = duration.asSeconds()
      const payload = {
        type: 'other',
        start: input.start,
        end: input.end,
        isPaid: input.isPaid,
        duration: {
          value: durationvalue,
          text: durationtext
        },
        index: input.index
      }
      return {
        type: 'ADD_TRIP_' + type,
        payload: payload
      }
    }
  }
  return {
    type: 'NONE',
    payload: null
  }
}
