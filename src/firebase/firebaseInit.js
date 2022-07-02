import firebase from 'firebase/app'
import "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyA2nBL34EfvTBy291uv0tBwz4ZVQTsN0zU",
    authDomain: "fireblog-40ca4.firebaseapp.com",
    projectId: "fireblog-40ca4",
    storageBucket: "fireblog-40ca4.appspot.com",
    messagingSenderId: "576288559035",
    appId: "1:576288559035:web:9904544921c04ceb6c7e9e"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig)
  const timestamp = firebase.firestore.FieldValue.serverTimestamp

  export {timestamp}
  export default firebaseApp.firestore()