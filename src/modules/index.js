import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import prices from '../reducers/prices'
import routes from '../reducers/routes'
import trips from '../reducers/trips'

export default combineReducers({
  routing: routerReducer,
  prices,
  trips,
  routes
})
