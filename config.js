import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyC1nBqGwlusoOTNDvELAr4zQEMDp8r3XkM",
    authDomain: "currency-detection-app-4b555.firebaseapp.com",
    projectId: "currency-detection-app-4b555",
    storageBucket: "currency-detection-app-4b555.appspot.com",
    messagingSenderId: "481251003593",
    appId: "1:481251003593:web:49def41daff336efae5118",
    measurementId: "G-3ZXJBEKWVW"
  };
  
if(!firebase.apps.length)
{
    firebase.initializeApp(firebaseConfig);
}

export {firebase};