import React from 'react'
import SongPlayer from './SongPlayer.js';
import './App.css';
import Navbar from './Navbar.js';
import Profile from './Profile.js';
import Feed from './Feed.js'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, onAuthStateChanged} from "firebase/auth";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc} from "firebase/firestore"
import { getStorage, ref , getDownloadURL, listAll } from "firebase/storage"
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
let songList = [];

function App() {
  const [propic, setPropic] = React.useState(auth.currentUser ? auth.currentUser.providerData[0].photoURL : null);
  // console.log(db)
 
  
  const [songs, setSongs] = React.useState(null);
  const [feed, setFeed] = React.useState(true);
  const [featuredSong, setFeaturedSong] = React.useState(null);
  
  React.useEffect(() => {
    setPropic(auth.currentUser ? auth.currentUser.providerData[0].photoURL : null) 
    if(auth.currentUser){
      const userRef = collection(db, "users");
      setDoc(doc(userRef, auth.currentUser.displayName), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        propic: auth.currentUser.providerData[0].photoURL,
      });
      updateDoc(doc(userRef, auth.currentUser.displayName), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        propic: auth.currentUser.providerData[0].photoURL,
      });
    }
  }, [auth.currentUser])


  if(feed){
    return (
      <div className="App">
        <Navbar auth={auth} provider={provider} signIn={signIn} googleAuth={googleAuth} getRedirect={getRedirect} propic={propic} setPropic={setPropic} feed={feed} setFeed={setFeed}/>
        <Feed featuredSong={featuredSong} setFeaturedSong={setFeaturedSong} db={db}/>
      </div>
    );
  } else {
    return(
      <div className="App">
        <Navbar auth={auth} provider={provider} signIn={signIn} googleAuth={googleAuth} getRedirect={getRedirect} propic={propic} setPropic={setPropic} feed={feed} setFeed={setFeed}/>
        <Profile auth={auth} propic={propic} songs={songs} setSongs={setSongs} songList={songList}/>
      </div>
    )
  }
  
}

export default App;
