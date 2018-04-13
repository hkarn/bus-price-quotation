import firebase from '../config/firebase'

/**
* Imports our stored prices from the database/firebase
* @return {Function}
*/
export function readPrices () {
  return function (dispatch) {
    return firebase.database().ref('prices')
      .once('value')
      .then((snapshot) => {
        return dispatch({
          type: 'IMPORT_PRICES',
          payload: snapshot.val()
        })
      })
  }/*
    .catch(error => {
      dispatch({type: "FETCH_ERROR", error: error.message})
    }) */
}
