import React from 'react'
import './App.css';
import Navbar from './Navbar.js';
import Profile from './Profile.js';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, onAuthStateChanged} from "firebase/auth";
import { getFirestore } from "firebase/firestore"
import { getStorage, ref , getDownloadURL } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAl4Z6JEWE6Z-QJjbxnlbtxMnTpDa2Vons",
  authDomain: "coverpool-c532b.firebaseapp.com",
  projectId: "coverpool-c532b",
  storageBucket: "coverpool-c532b.appspot.com",
  messagingSenderId: "1044728278050",
  appId: "1:1044728278050:web:1ef680c6a2b85306a8ee7b",
  measurementId: "G-NTYSVF7R3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
let user;
const googleAuth = GoogleAuthProvider;
const getRedirect = getRedirectResult;
const provider = new GoogleAuthProvider();
const signIn = signInWithRedirect;
const storage = getStorage();
// const pathReference = ref(storage, 'You Found It.mp3')
const pathReference = ref(storage, 'AnryGuiltar/arabesque.mp3')
console.log(pathReference._location.path_);
let nothing = 0;

function App() {
  const [propic, setPropic] = React.useState(auth.currentUser ? auth.currentUser.providerData[0].photoURL : null);
  const [songSource, setSongSource] = React.useState(null);
  onAuthStateChanged(auth, () => setPropic(auth.currentUser ? auth.currentUser.providerData[0].photoURL : null) );
  getDownloadURL(pathReference).then((url) => {
    setSongSource(url);
  })
  .catch((error) => {
    console.log(error)
  })
  return (
    <div className="App">
      <Navbar auth={auth} provider={provider} signIn={signIn} googleAuth={googleAuth} getRedirect={getRedirect} propic={propic} setPropic={setPropic}/>
      <Profile auth={auth} propic={propic} songSource={songSource}/>
    </div>
  );
}

export default App;
