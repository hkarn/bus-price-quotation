import firebase from './../config/firebase.js';

const calculator = (km, hours) => {

  const prices = null;

  firebase.database().ref("prices")
    .once('value')
        .then((snapshot) => {
          console.log(snapshot.val())
          this.prices = snapshot.val()
      })
  
 console.log(prices)
  

}
export default calculator;