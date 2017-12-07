import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import prices from '../reducers/prices'
import routes from '../reducers/routes'

export default combineReducers({
  routing: routerReducer,
  prices,
  routes
})