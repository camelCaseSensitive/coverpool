import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link, 
  Navigate
} from "react-router-dom";
import { useParams } from 'react-router';
import './App.css';
import { render } from 'react-dom';

// FIREBASE
import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, onAuthStateChanged} from "firebase/auth";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc} from "firebase/firestore"
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll} from "firebase/storage";
import { getDatabase, ref as dbRef, set as dbSet, get as dbGet, update, onValue} from 'firebase/database'

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
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const rtdb = getDatabase();
// console.log(rtdb)
const auth = getAuth();
const googleAuth = GoogleAuthProvider;
const getRedirect = getRedirectResult;
const provider = new GoogleAuthProvider();
const signIn = signInWithRedirect;

let loggedIn = false;
let newUsername = "";
// let usernameAvailable = true;
let globalUserName = null;

// function login(setUser) {
//   console.log("LOGIN!")
//   console.log(auth.currentUser)
//   if(!auth.currentUser){
//       signIn(auth, provider);
//       getRedirect(auth)
//       .then((result) => {
//           // This gives you a Google Access Token. You can use it to access Google APIs.
//           const credential = googleAuth.credentialFromResult(result);
//           const token = credential.accessToken;
//           // The signed-in user info.
//           onAuthStateChanged(() => setUser(auth.currentUser)  );
//       }).catch((error) => {
//           console.log("There was an error")
//           // Handle Errors here.
//           const errorCode = error.code;
//           const errorMessage = error.message;
//           // The email of the user's account used.
//           const email = error.email;
//           // The AuthCredential type that was used.
//           const credential = googleAuth.credentialFromError(error);
//           // ...
//       })
//   } else {
//     setUser(auth.currentUser) 
//   }
// }

function App() {
  const [user, setUser] = React.useState(auth.currentUser);
  const [userProPic, setUserProPic] = React.useState(auth.currentUser ? auth.currentUser.providerData[0].photoURL : null)
  // const [userName, setUserName] = React.useState(auth.currentUser ? auth.currentUser.providerData[0].displayName : null)
  const [userName, setUserName] = React.useState(null)
  const [hasUsername, setHasUsername] = React.useState("tbd");
  const [usernameAvailable, setUsernameAvailable] = React.useState("")
  const [availabilityMessage, setAvailabilityMessage] = React.useState(true)

  auth.onAuthStateChanged(function (user) {
    if(user){
      loggedIn = true;
      // console.log(user.uid)
      // console.log("You are now logged in")
      if(document.getElementById("myFile")) document.getElementById("myFile").disabled = false;
      setUser(user) 
      setUserProPic(user.providerData[0].photoURL)
      // setUserName(user.providerData[0].displayName)

      const userRef = collection(db, "users");
      const yourUsername = dbRef(rtdb, "/users/" + auth.currentUser.uid);
      dbGet(yourUsername).then((res) => {
        if(res._node.value_){
          // console.log(res._node.value_)
          setUserName(res._node.value_)
          globalUserName = res._node.value_;
        } else {
          setHasUsername(false)
          // console.log("Need to create a username")
        }
      })
    
      // If this user already has a username in the realtime database
      // update their info
      if(userName){
        updateDoc(doc(userRef, userName), {
          uid: auth.currentUser.uid,
          name: auth.currentUser.displayName,
          propic: auth.currentUser.providerData[0].photoURL,
          username: globalUserName
        });
      }
    }
  });

  function login() {
    // console.log("LOGIN!")
    // console.log(auth.currentUser)
    if(!auth.currentUser){
        signIn(auth, provider);
        getRedirect(auth)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access Google APIs.
            const credential = googleAuth.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            // onAuthStateChanged(() => {
            //   console.log("YOU HAV JUST LOGGED IN")
            //   // setUser(auth.currentUser) 
            //   // setUserProPic(auth.currentUser.providerData[0].photoURL)
            //   // setUserName(auth.currentUser.providerData[0].displayName)
            // });
        }).catch((error) => {
            // console.log("There was an error")
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = googleAuth.credentialFromError(error);
            // ...
        })
    } else {
      setUser(auth.currentUser) 
    }
  }

  function logout() {
    auth.signOut().then(() => {console.log("signedout")});
    setUser(null) 
    setUserProPic(null)
    setUserName(null)
    window.location.href = '/'
  }

  if(hasUsername === false){
    return(
      <div>
        <p>Create a username for your account</p>
        <p>- 3-20 characters</p>
        <p>- no spaces or special characters</p>
        <input id="newusername" onKeyUp={() => {
          // console.log("keyup")
          newUsername = document.getElementById("newusername").value;

          var usernameFormat = /^(\d{3,20}|\w{3,20}){1}$/;;
          if(!usernameFormat.test(newUsername)){
            if(newUsername.length < 3) { 
              setAvailabilityMessage("Username is too short")
            } else if(newUsername.length > 20) {
               setAvailabilityMessage("Username is too long")
            } else {
              setAvailabilityMessage("Username cannont contain any spaces or special characters")
            }
            setUsernameAvailable(false)
          } else {
            dbGet(dbRef(rtdb, "/users/")).then((res) => {
              setUsernameAvailable(true)
              setAvailabilityMessage("")
              res.forEach((username) => {
                if(username._node.value_ == newUsername){
                  setUsernameAvailable(false)
                  setAvailabilityMessage("Sorry that username is already taken")
                  // console.log("MATCH")
                }
              })
            })
          }
      }}></input>
      <p>{availabilityMessage}</p>
        <button onClick={() => {
          dbSet(dbRef(rtdb, "/users/" + auth.currentUser.uid), newUsername)
          setUserName(newUsername)
          setHasUsername(true)
          globalUserName = newUsername;
          const userRef = collection(db, "users");
          setDoc(doc(userRef, newUsername), {
            uid: auth.currentUser.uid,
            name: auth.currentUser.displayName,
            propic: auth.currentUser.providerData[0].photoURL,
            username: globalUserName
          });
        }} disabled={!usernameAvailable}> Create Account</button>
      </div>
    )
  } else {
    return (
      <Router>
        <div id="entireApp">
          {/* <h1>{userName}</h1> */}
          <nav className="nav-bar">
            <div className='header'>
              <Link to={"/user/" + userName}><img className="profile" src={userProPic}/></Link>
              <h1 id="cvrpl">CVRPL</h1>
            </div>
            <ul className="nav-bar-links">
              <li className="nav-bar-link">
                <Link to="/">Home</Link>
              </li>
              <li className="nav-bar-link">
                <Link to="/about">About</Link>
              </li>
              <li className="nav-bar-link">
                <Link to="/users">Users</Link>
              </li>
              <li className="nav-bar-link">
                <Link to="/uploadsong">+ Upload Orginal</Link>
              </li>
            </ul>
            <button className="login" onClick={login}> Login </button>
            <button className="logout" onClick={logout}> Logout </button>
          </nav>

          <Routes>
            <Route path="/about" element={<About/>}></Route>
            <Route path="/users" element={<Users/>}> </Route>
            <Route path="/uploadsong" element={<UploadSong/>}></Route>
            <Route path="/uploadcover" element={<UploadCover/>}></Route>
            <Route path="/user/:username" element={<UserProfile/>}> </Route>
            <Route path="/user/:username/:content" element={<UserContent/>}> </Route>
            <Route path="/user/:username/:originals" element={<UserContent/>}> </Route>
            <Route path="/user/:username/:originals/:song" element={<UserOriginal/>}> </Route>
            <Route path="/user/:username/:covers" element={<UserContent/>}> </Route>
            <Route path="/user/:username/:covers/:artist" element={<UserContent/>}> </Route>
            <Route path="/user/:username/:covers/:artist/:song" element={<UserCover/>}> </Route>
            <Route path="/user/:username/:likes" element={<UserContent/>}> </Route>
            <Route path="/user/:username/:matches" element={<UserContent/>}> </Route>
            <Route path="/user/:username/:matches/:match" element={<UserContent/>}> </Route>
            <Route path="/" element={<Home/>}> </Route>
          </Routes>
        </div>
      </Router>
    );
  }
}

class Home extends React.Component {
  render() {
    return (
      <div className="Home">
        <h2>Home</h2>
        <h3>Featured Cover: </h3>
        <img src="https://i.imgur.com/yAZtxaq.png" style={{borderRadius: "100%"}}></img>
        <a href="/user/bentzboy887/covers/sammy77/kill-rock-stars-2"> sammy77 - kill rock stars 2 (cover by bentzboy887) </a> 
        <SongPlayer songSource={'https://firebasestorage.googleapis.com/v0/b/coverpool-c532b.appspot.com/o/6sTnYDIWzbXSa5XJXKnr6KRPJ0G2%2Fcovers%2Fsammy77%2Fkill%20rock%20stars%202%2Fkillrockstars.mp3?alt=media&token=d7fe50bd-722c-4cbb-89c4-bf4418055802'} songName = "kill-rock-stars-2" />

        <h3>User Activity: </h3>
        <p><a href="/user/winnower">winnower</a> posted a <a href="/user/winnower/covers/buryingvarian/my-insides-"> cover of my insides </a> by <a href="/user/buryingvarian">buryingvarian</a></p>
        <p><a href="/user/Anry">Anry</a> posted a <a href="/user/Anry/Covers/buryingvarian/pacing-"> cover of pacing </a> by <a href="/user/buryingvarian">buryingvarian</a></p>
        <p><a href="/user/Anry">Anry</a> uploaded <a href="/user/Anry/originals/Hot-Girl-Summer">Hot Girl Summer</a></p>
        <p><a href="/user/hillview73">hillview73</a> uploaded <a href="/user/hillview73/originals/love-will-keep-me-strong">love will keep me strong</a></p>
        <p><a href="/user/buryingvarian">buryingvarian</a> uploaded <a href="/user/buryingvarian/originals/my-insides-">my insides</a></p>
        <p><a href="/user/buryingvarian">buryingvarian</a> posted a <a href="/user/buryingvarian/Covers/sammy77/bullshit-baby"> cover of bullshit baby </a> by <a href="/user/sammy77">sammy77</a></p>
        <p><a href="/user/buryingvarian">buryingvarian</a> uploaded <a href="/user/buryingvarian/originals/pacing-">pacing</a></p>
        <p><a href="/user/buryingvarian">buryingvarian</a> posted a <a href="/user/buryingvarian/covers/yoshinoya43/dog"> cover of dog </a> by <a href="/user/yoshinoya43">yoshinoya43</a></p>
        <p><a href="/user/Anry">Anry</a> posted a <a href="/user/Anry/Covers/buryingvarian/talk-off-ur-ear"> cover of talk off ur ear </a> by <a href="/user/buryingvarian">buryingvarian</a></p>
        <p><a href="/user/Anry">Anry</a> posted a <a href="/user/Anry/Covers/mallardwest/Slow-On-Slow-Forth"> cover of Slow On So Forth </a> by <a href="/user/mallardwest">mallardwest</a></p>
        <p><a href="/user/mallardwest">mallardwest</a> uploaded <a href="/user/mallardwest/originals/Slow-On-Slow-Forth">Slow On Slow Forth</a></p>
        <p><a href="/user/buryingvarian">buryingvarian</a> uploaded <a href="/user/buryingvarian/originals/talk-off-ur-ear">talk off ur ear</a></p>
        <p><a href="/user/wearehere349">wearehere349</a> uploaded <a href="/user/wearehere349/originals/Somewhere-Nice">Somewhere Nice</a></p>
        <p><a href="/user/Anry">Anry</a> uploaded <a href="/user/Anry/originals/Wordle">Wordle</a></p>
        <p><a href="/user/Anry">Anry</a> posted a <a href="/user/Anry/Covers/isaac/Dreams"> cover of Dreams </a> by <a href="/user/isaac">isaac</a></p>
        <p><a href="/user/winnower">winnower</a> uploaded <a href="/user/winnower/originals/fling-me-into-the-sun">fling me into the sun</a></p>
        <p><a href="/user/isaac">isaac</a> uploaded <a href="/user/isaac/originals/Dreams">Dreams</a></p>
        <p><a href="/user/girlsatthecarnival">girlsatthecarnival</a> uploaded <a href="/user/girlsatthecarnival/originals/Your-cat-Demo-2">Your cat Demo 2</a></p>
        <p><a href="/user/bentzboy887">bentzboy887</a> uploaded <a href="/user/bentzboy887/originals/T.M.L">T.M.L</a></p>
        <p><a href="/user/sammy77">sammy77</a> uploaded <a href="/user/sammy77/originals/bullshit-baby">bullshit baby</a></p>
        <p><a href="/user/bentzboy887">bentzboy887</a> posted a <a href="/user/bentzboy887/covers/sammy77/kill-rock-stars-2"> cover of kill rock stars 2 </a> by <a href="/user/sammy77">sammy77</a></p>
        <p><a href="/user/sammy77">sammy77</a> uploaded <a href="/user/sammy77/originals/allright">allright</a></p>
        <p><a href="/user/sammy77">sammy77</a> posted a <a href="/user/sammy77/covers/mott/Bald-patch"> cover of Bald patch </a> by <a href="/user/mott">mott</a></p>
        <p><a href="/user/Anry">Anry</a> uploaded <a href="/user/Anry/originals/Sober-Joey">Sober Joey</a></p>
        <p><a href="/user/Anry">Anry</a> uploaded <a href="/user/Anry/originals/Speedracer">Speedracer</a></p>
        <p><a href="/user/yoshinoya43">yoshinoya43</a> uploaded <a href="/user/yoshinoya43/originals/dog">dog</a></p>
        <p><a href="/user/Anry">Anry</a> posted a <a href="/user/Anry/covers/mott/Bald-patch"> cover of Bald patch </a> by <a href="/user/mott">mott</a></p>
        <p><a href="/user/Anry">Anry</a> posted a <a href="/user/Anry/covers/doahnean/dandelion"> cover of dandelion </a> by <a href="/user/doahnean">doahnean</a></p>
        <p><a href="/user/sammy77">sammy77</a> posted a <a href="/user/sammy77/covers/Anry/Marsha-at-the-Door"> cover of Marsha at the Door </a> by <a href="/user/Anry">Anry</a></p>
        <p><a href="/user/mott">mott</a> uploaded <a href="/user/mott/originals/Bald-patch">Bald patch</a></p>
        <p><a href="/user/Wombat_Rob">Wombat_Rob</a> uploaded <a href="/user/Wombat_Rob/originals/The-Fuzzy-Caterpillar">The Fuzzy Caterpillar</a></p>
        <p><a href="/user/mallardwest">mallardwest</a> posted a <a href="/user/mallardwest/covers/doahnean/dandelion"> cover of dandelion </a> by <a href="/user/doahnean">doahnean</a></p>
        <p><a href="/user/sammy77">sammy77</a> uploaded <a href="/user/sammy77/originals/kill-rock-stars-2">kill rock stars 2</a></p>
        <p><a href="/user/bentzboy887">bentzboy887</a> uploaded <a href="/user/bentzboy887/originals/HIGH-TIMES">HIGH TIMES</a></p>
        <p><a href="/user/ScottH">ScottH</a> uploaded <a href="/user/ScottH/originals/pearl">pearl</a></p>
        <p><a href="/user/doahnean">doahnean</a> uploaded <a href="/user/doahnean/originals/dandelion">dandelion</a></p>
        <p><a href="/user/8bitwizrd">8bitwizrd</a> uploaded <a href="/user/8bitwizrd/originals/Blue">Blue</a></p>
        <p><a href="/user/Anry">Anry</a> uploaded <a href="/user/Anry/originals/Marsha-at-the-Door">Marsha at the Door</a></p>
        {/* <p>Browse more users</p>
        <nav>
            <ul>
              <li>
                <Link to="/users">Users</Link>
              </li>
            </ul>
          </nav> */}
      </div>
    ) 
  }
}

function About() {
  return (
    <div class="About">
      <h2>About</h2>
      <p>Coverpool is a place for songwriters to discover and share music by covering each other's songs.</p>
      <h3>How it works</h3>
      <ol>
        <li>Login with Google</li>
        <li>You'll then be prompted to create a username</li>
        <li>Upload an original</li>
        <li>Cover other artists</li>
        <li>Each cover you submit lets you upload one more original</li>
      </ol>
      <p>If you need help with something email <a href = "mailto: anryguiltar@gmail.com">anry guiltar</a></p>
    </div>
  )
}

function Users() {
  const [usersArray, setUsersArray] = React.useState([])
  React.useEffect(() => {
    let dbUsernames = [];
    // let numberOfUsers = 0;
    dbGet(dbRef(rtdb, "/users/")).then((res) => {
      res.forEach((u) => {
        // let userImgSrc;
        // numberOfUsers += 1;
        if(u._node.value_ != "default") {
          // // Tried adding pictures
          // getDoc(doc(db, "users", u._node.value_)).then((docSnap) => {
          //   userImgSrc = docSnap.data().propic;
          //   console.log(userImgSrc)
          //   dbUsernames.push(<li key={u._node.value_}><div><img src={userImgSrc}/><Link to={"/user/" + u._node.value_}>{u._node.value_}</Link></div></li>)
          //   // console.log(dbUsernames)
          // })
          dbUsernames.push(<li key={u._node.value_}><Link to={"/user/" + u._node.value_}>{u._node.value_}</Link></li>)
        }
      })
    }).then(() => {
      setUsersArray(dbUsernames)
    })
  }, [])
  
  return (
    <div className="Users">
      <h2>Users</h2>
      <nav>
        <ul>
          {usersArray}
        </ul>
      </nav>
    </div>
  )
}

function UserProfile() {
  const { username } = useParams();
  const [userPic, setUserPic] = React.useState(null);
  const [userOriginals, setUserOriginals] = React.useState(null);
  const [userCovers, setUserCovers] = React.useState(null);
  const [aboutMe, setAboutMe] = React.useState(null);

  let originalsComponentArray = [];
  let coversComponentArray = [];
  let uid;

  React.useEffect(() => {
    // console.log("This will only run once!")
    getDoc(doc(db, "users", username)).then((docSnap) => {
      let profs = [];
      // console.log(docSnap.data())
      uid = docSnap.data().uid;
      setUserPic(docSnap.data().propic)
      console.log(docSnap.data().propic)
    }).then(() => {
      const storage = getStorage();
      const originalsRef = ref(storage, uid + '/originals');
      listAll(originalsRef)
      .then((res) => {
        res.items.forEach((itemRef) => {
          let songPath = itemRef._location.path_.split('/')
          getDownloadURL(itemRef).then((url) => {
            let songFileName = songPath[songPath.length-1].slice(0,-4);

            // If filename has spaces in it add dashes
            if(songFileName.split(' ').length > 1){
              let songWords = songFileName.split(' ');
              songFileName = "";
              for(let i = 0; i < songWords.length; i++){
                if(i != songWords.length - 1) {
                  songFileName = songFileName.concat(songWords[i],'-');
                } else {
                  songFileName = songFileName.concat(songWords[i])
                }
              }
            }
            originalsComponentArray.push(<li key={url}><Link to={"/user/" + username + "/originals/" + songFileName}>{songPath[songPath.length-1].slice(0,-4)}</Link></li>);
          }).then(() => {
            if(originalsComponentArray.length == res.items.length) setUserOriginals(originalsComponentArray)
          }).catch((error) => {
            console.log(error)
          })
        });
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

      const coversRef = ref(storage, uid + '/covers');
      // console.log(coversRef)
      let numberOfCovers = 0;
      let originalArtist;
      let originalSongName;
      listAll(coversRef)
      .then((res) => {
        for(let i = 0; i < res.prefixes.length; i++){
          let artistRef = ref(storage, res.prefixes[i]._location.path_);
          listAll(artistRef)
          .then((art) => {
            for(let k = 0; k < art.prefixes.length; k++){
              let songRef = ref(storage, art.prefixes[k]._location.path_)
              listAll(songRef).then((song) => {
                for(let j = 0; j < song.items.length; j++){
                  numberOfCovers += 1;
                  // console.log(song.items[0]._location.path_)
                  let songPath = song.items[j]._location.path_.split('/');
                  getDownloadURL(song.items[j]).then((url) => {
                    originalArtist = song.items[0]._location.path_.split('/')[2]; 
                    originalSongName = song.items[0]._location.path_.split('/')[3];

                    // Replace spaces with dashes in song name
                    if(originalSongName.split(' ').length > 1){
                      let songWords = originalSongName.split(' ');
                      originalSongName = "";
                      for(let i = 0; i < songWords.length; i++){
                        if(i != songWords.length - 1) {
                          originalSongName = originalSongName.concat(songWords[i],'-');
                        } else {
                          originalSongName = originalSongName.concat(songWords[i])
                        }
                      }
                    }
                    coversComponentArray.push(<li key={url}><Link to={"/user/" + username + "/covers/" + originalArtist + "/" + originalSongName}>{originalArtist + " - " + song.items[0]._location.path_.split('/')[3]}</Link></li>);
                  }).then(() => {
                    // console.log(numberOfCovers)
                    if(coversComponentArray.length == numberOfCovers) {
                      setUserCovers(coversComponentArray)
                    }
                  }).catch((error) => {
                    console.log(error)
                  })
                }
              })
            }
          })
        }
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });
    })

    getDoc(doc(db, "users/" + username + "/About/UserInfo/")).then((docSnap) => {
      if(docSnap.data()) setAboutMe(<p>{docSnap.data().Info}</p>)
      console.log(aboutMe)
    })
  }, [username])

  if(username == globalUserName) {
    return (
      <div className="UserProfile">
        <h2>{username}</h2>
        <img src={userPic}/>

        <p>About me</p>
        <textarea id="userInfo" style={{whiteSpace: "pre-wrap"}}></textarea>
        <button onClick={() => {
          const aboutRef = collection(db, "users/" + globalUserName + "/About/");
          setAboutMe(document.getElementById("userInfo").value)
          setDoc(doc(aboutRef, "UserInfo"), {
            Info: document.getElementById("userInfo").value
          });
        }}>SAVE</button>
        <div style={{whiteSpace: "pre-wrap"}}>{aboutMe}</div>

        <h3>Originals</h3>
        <nav>
          <ul>
            {userOriginals}
          </ul>
        </nav>

        <h3>Covers</h3>
        <nav>
          <ul>
            {userCovers}
          </ul>
        </nav>
      </div>
    );
  } else {
    return (
      <div className="UserProfile">
        <h2>{username}</h2>
        <img src={userPic}/>
        <h3>About:</h3>
        <div style={{whiteSpace: "pre-wrap"}}>{aboutMe}</div>
        <h3>Originals</h3>
        <nav>
          <ul>
            {userOriginals}
          </ul>
        </nav>

        <h3>Covers</h3>
        <nav>
          <ul>
            {userCovers}
          </ul>
        </nav>
      </div>
    );
  }
}

function UserContent() {
  const song = useParams()['content'];
  // let coverVersions = {artist1: song, artist: song, artist: song, 'Cover4'};
  // console.log(song)
  return (
    <div>
      <h2>{song}</h2>
    </div>
  );
}

function UserOriginal() {
  const song = useParams()['song'];
  const user = useParams()['username']
  const [songComponent, setSongComponent] = React.useState(null);
  const [coversComponent, setCoversComponent] = React.useState(<p>No covers yet</p>);
  const [songInfo, setSongInfo] = React.useState(null);
  let coveredBy = ["Allen", "Brian", "Cindy", "Daniel"];
  let uid;
  // console.log(song)

  // Convert dashes to spaces in song name
  let undashedSong = "";
  if(song.split('-').length > 1){
    let songWords = song.split('-');
    for(let i = 0; i < songWords.length; i++){
      if(i != songWords.length - 1) {
        undashedSong = undashedSong.concat(songWords[i],' ');
      } else {
        undashedSong = undashedSong.concat(songWords[i])
      }
    }
  } else {
    undashedSong = song;
  }


  React.useEffect(() => {
    // console.log("This will only run once!")
    
    // getData();
    getDoc(doc(db, "users", user)).then((docSnap) => {
      // let profs = [];
      // console.log(docSnap.data())
      uid = docSnap.data().uid;
      // setUserPic(docSnap.data().propic)
      // console.log(docSnap.data().propic)
    }).then(() => {
      const storage = getStorage();
      const itemRef = ref(storage, uid + '/originals/'+ undashedSong + ".mp3");
      getDownloadURL(itemRef).then((url) => {
        // console.log(url)
        setSongComponent(<SongPlayer songSource={url} songName = {undashedSong} />)
      }).catch((error) => {
        console.log(error)
      })
    })

    getDoc(doc(db, "users/" + user + "/Originals/" + undashedSong)).then((docSnap) => {
      // console.log(docSnap.data())
      let coverVersions = docSnap.data();
      let coversArray = [];
      // console.log(coverVersions)
      for (const coverArtist in coverVersions) {
        // console.log(coverArtist, coverVersions[coverArtist]);
        // console.log("user/" + coverArtist + "/Covers/" + user + "/" + song)
        if(coverArtist != 'default'){
          coversArray.push(
            <li key={coverArtist + song}>
              <Link to={"/user/" + coverArtist + "/Covers/" + user + "/" + song}>{coverArtist}</Link>
            </li>
          )
        }
      }
      if(coversArray.length > 0) setCoversComponent(coversArray)
    })

    getDoc(doc(db, "users/" + user + "/Originals/" + undashedSong + "/Info/SongInfo")).then((docSnap) => {
      if(docSnap.data()) setSongInfo(<p>{docSnap.data().Lyrics}</p>)
    })
    // .then(() => {
    //   const storage = getStorage();
    //   const itemRef = ref(storage, uid + '/originals/'+ song + ".mp3");
    //   getDownloadURL(itemRef).then((url) => {
    //     console.log(url)
    //     setSongComponent(<SongPlayer songSource={url} songName = {song} />)
    //   }).catch((error) => {
    //     console.log(error)
    //   })
    // })

  }, [])

  if(user != globalUserName) {
    return (
      <div className="Original">
        <h2>{undashedSong}</h2>
        <div>{songComponent}</div>
        <div style={{whiteSpace: "pre-wrap"}}>{songInfo}</div>
        <h3>Cover Versions by</h3>
        <nav>
          {coversComponent}
        </nav>
        <UploadCover/>
      </div>
    );
  } else {
    return (
      <div className="Original">
        <h2>{undashedSong}</h2>
        <div>{songComponent}</div>
        {/* <input></input> */}
        <p>Description, Lyics, Tabs etc.</p>
        <textarea id="songInfo" style={{whiteSpace: "pre-wrap"}}></textarea>
        <button onClick={() => {
          const infoRef = collection(db, "users/" + globalUserName + "/Originals/" + undashedSong + "/Info/");
          setSongInfo(document.getElementById("songInfo").value)
          setDoc(doc(infoRef, "SongInfo"), {
            Lyrics: document.getElementById("songInfo").value
          });
        }}>SAVE</button>
        <div style={{whiteSpace: "pre-wrap"}}>{songInfo}</div>
        <h3>Cover Versions by</h3>
        <nav className="Original">
          {coversComponent}
        </nav>
      </div>
    );
  }
}

function UserCover() {
  const song = useParams()['song'];
  const user = useParams()['username'];  // Cover artist
  const artist = useParams()['artist'];  // Original artist
  const [songComponent, setSongComponent] = React.useState(null);
  let uid;
  let coveredBy = ["Allen", "Brian", "Cindy", "Daniel"];
  // console.log(song)

  // Convert dashes to spaces in song name
  let undashedSong = "";
  if(song.split('-').length > 1){
    let songWords = song.split('-');
    for(let i = 0; i < songWords.length; i++){
      if(i != songWords.length - 1) {
        undashedSong = undashedSong.concat(songWords[i],' ');
      } else {
        undashedSong = undashedSong.concat(songWords[i])
      }
    }
  } else {
    undashedSong = song;
  }

  React.useEffect(() => {
    // console.log("This will only run once!")
    
    // getData();
    getDoc(doc(db, "users", user)).then((docSnap) => {
      // let profs = [];
      // console.log(docSnap.data())
      uid = docSnap.data().uid;
      // setUserPic(docSnap.data().propic)
      // console.log(docSnap.data().propic)
    }).then(() => {
      const storage = getStorage();

      const userRef = collection(db, "users/" + artist + "/Originals/");
      getDoc(doc(userRef, undashedSong)).then((songFile) => {
        // console.log(songFile._document.data.value.mapValue.fields[user].stringValue.split('/')[3])
        const itemRef = ref(storage, uid + '/covers/'+ artist + "/" + songFile._document.data.value.mapValue.fields[user].stringValue.split('/')[3]);
        listAll(itemRef).then((song) => {
          // console.log(song.items[0]._location.path_)
          // console.log(itemRef)
          getDownloadURL(ref(storage, song.items[0]._location.path_)).then((url) => {
            // console.log(url)
            setSongComponent(<SongPlayer songSource={url} songName = {song} />)
          }).catch((error) => {
            console.log(error)
          })
        })
      });
    })
  }, [])

  return (
    <div className="Cover">
      <h2>{undashedSong}</h2>
      <div>{songComponent}</div>
      <h4>Cover by <Link to={"/user/" + user}>{user}</Link></h4>
      <h3>Originally by <Link to={"/user/" + artist}>{artist}</Link></h3>
    </div>
  );
}

function SongPlayer(props) {
    return (
        <div className="SongPlayer">
            {/* <p >{props.songName ? props.songName.slice(0,-4) : "unnamed"}</p> */}
            <audio controls className="Player">
                <source src={props.songSource} type="audio/mpeg" />
            </audio>
        </div>
    )  
}

function UploadSong() {
  const [percent, setPercent] = React.useState(null);
  const [originalUpload, setOriginalUpload] = React.useState(null);
  const [songName, setSongName] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [uploadButton, setUploadButton] = React.useState(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)}></input>);

  let numberOfOriginals = 0;
  let numberOfCovers = 0;

  // auth.onAuthStateChanged(function (user) {
  //   if(user){
      
  //   }
  // });

  React.useEffect(() => {
    const storage = getStorage();
      if(auth.currentUser && auth.currentUser.uid != null){
        const originalsRef = ref(storage, auth.currentUser.uid + '/originals/');
        const coversRef = ref(storage, auth.currentUser.uid + '/covers/');
        listAll(originalsRef)
        .then((res) => {
          // console.log(res.items.length);
          numberOfOriginals = res.items.length;
        }).then(() => {
          listAll(coversRef)
          .then((coverArtists) => {
            coverArtists.prefixes.forEach((coversOfArtist) => {
              listAll(coversOfArtist).then((res) => {
                // console.log(res)
                numberOfCovers += res.prefixes.length
                // console.log("You've made " + numberOfCovers + " covers")
                if(numberOfOriginals - numberOfCovers > 0){
                  // console.log("You've uploaded " + numberOfOriginals + " originals and " + numberOfCovers + "covers")
                  setMessage("You'll be able to upload another original after you submit your next cover");
                  setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} disabled ></input>);
                  return;
                } else {
                  setMessage("");
                  setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} ></input>);
                }
              })
            })
          })
          if(numberOfOriginals - numberOfCovers > 0){
            // console.log("You've uploaded " + numberOfOriginals + " originals and " + numberOfCovers + "covers")
            setMessage("You'll be able to upload another original after you submit your next cover");
            setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} disabled ></input>);
            return;
          } else {
            setMessage("");
            setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} ></input>);
          }
        }).catch((error) => {
          // Uh-oh, an error occurred!
        });
      } else {
        // <Navigate to="/About" />;
        window.location.href = '/'
        // setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} disabled ></input>);
        // setMessage("You must be logged in to upload a song.  If you are logged in navigate here from the home page.");
      }
  }, [])

  function handleFile(e){
    let file = e.target.files[0];

    const storage = getStorage();
    // const originalsRef = ref(storage, auth.currentUser.uid + '/originals/');
    // const coversRef = ref(storage, auth.currentUser.uid + '/covers/');
    // listAll(originalsRef)
    // .then((res) => {
    //   console.log(res.items.length);
    //   numberOfOriginals = res.items.length;
    // }).then(() => {
    //   if(numberOfCovers == 0){
    //     listAll(coversRef)
    //     .then((coverArtists) => {
    //       coverArtists.prefixes.forEach((coversOfArtist) => {
    //         listAll(coversOfArtist).then((res) => {
    //           numberOfCovers += res.items.length;
    //           if(numberOfOriginals - numberOfCovers > 0){
    //             setMessage("You'll be able to upload another original after you submit your next cover");
    //             setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} disabled ></input>);
    //             return;
    //           } else {
    //             setMessage("");
    //             setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} ></input>);
    //           }
    //         })
    //       })
    //     })
    //     if(numberOfOriginals - numberOfCovers > 0){
    //       console.log("You've uploaded " + numberOfOriginals + " originals and " + numberOfCovers + "covers")
    //       setMessage("You'll be able to upload another original after you submit your next cover");
    //       setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} disabled ></input>);
    //       return;
    //     } else {
    //       setMessage("");
    //       setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} ></input>);
    //     }
    //   }
      
    // }).catch((error) => {
    //   // Uh-oh, an error occurred!
    // });

    if(file.type != 'audio/mpeg'){
      setMessage("File type must be an mp3.");
      file = null;
      return;
    }

    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    let fileNameString = file.name.split('.')[0]
    if(format.test(fileNameString)){
      setMessage("File name cannont contain any special characters")
      file = null;
      return;
    } 

    if(file.size / 1024 / 1024 > 10){
      setMessage("File cannot be more than 10mb")
      file = null;
      return;
    }

    const metadata = {
      contentType: 'audio/mpeg'
    };

    const storageRef = ref(storage, auth.currentUser.uid + '/originals/' + file.name);

    const userRef = collection(db, "users/" + globalUserName + "/Originals/");
    // console.log(userRef)
    setDoc(doc(userRef, file.name.split('.')[0]), {
      default: "path"
    });

    let feedMessage = globalUserName + " uid: " + auth.currentUser.uid + " uploaded " + file.name.split('.')[0];
    dbSet(dbRef(rtdb, "/activity/" + Date.now()), feedMessage)

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercent(progress)
        // console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            // console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // console.log("unauthorized")
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // console.log("cancaled")
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            console.log("unknown")
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      }, 
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          setOriginalUpload(downloadURL)
          setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} disabled></input>)
        });
      }
    );
  }

  return (
    <div className="UploadOriginal">
      <div className="upload">
        <h2>Upload an original:</h2>
        <p id="cantUpload">{message}</p>
        {/* <div>
          <p id="songNameLabel">Song Name</p>
          <input id="songNameInput"></input>
        </div> */}
        {/* <label for="songname">Song Title: </label>
        <input type="text"></input> */}
        {/* <br></br> */}
        <p><strong>Song Title:</strong> <em>The name of the file will be the name of the song!</em></p>
        <p>file must be an mp3 less than 10mb</p>
        {uploadButton}
        <LoadingBar percent = {percent} />
      </div>
    </div>
  )
}

function UploadCover() {
  const artist = useParams()['username'];  // The original artist
  const song = useParams()['song'];
  // console.log("This ARTIST is " + artist);
  const [percent, setPercent] = React.useState(null);
  const [coverUpload, setCoverUpload] = React.useState(null);
  const [songName, setSongName] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [uploadButton, setUploadButton] = React.useState(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} disabled></input>);

  let numberOfOriginals = 0;
  let numberOfCovers = 0;

  // Convert dashes to spaces in song name
  let undashedSong = "";
  if(song.split('-').length > 1){
    let songWords = song.split('-');
    for(let i = 0; i < songWords.length; i++){
      if(i != songWords.length - 1) {
        undashedSong = undashedSong.concat(songWords[i],' ');
      } else {
        undashedSong = undashedSong.concat(songWords[i])
      }
    }
  } else {
    undashedSong = song;
  }
  // console.log(undashedSong)

  // React.useEffect(() => {
  //   const storage = getStorage();
  //   const originalsRef = ref(storage, auth.currentUser.uid + '/originals/');
  //   const coversRef = ref(storage, auth.currentUser.uid + '/covers/');
  //   listAll(originalsRef)
  //   .then((res) => {
  //     console.log(res.items.length);
  //     numberOfOriginals = res.items.length;
  //   }).then(() => {
  //     listAll(coversRef)
  //     .then((res) => {
  //       numberOfCovers = res.items.length;
  //       setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} ></input>);
  //     })
  //   }).catch((error) => {
  //     // Uh-oh, an error occurred!
  //   });
  // }, [])

  React.useEffect(() => {
    if(auth.currentUser && auth.currentUser.uid != null){
      setUploadButton(<input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)} ></input>)
    }
  }, [])

  function handleFile(e){
    let file = e.target.files[0];

    const storage = getStorage();
    const originalsRef = ref(storage, auth.currentUser.uid + '/originals/');
    const coversRef = ref(storage, auth.currentUser.uid + '/covers/');

    // Count the number of originals and covers that a user has
    // Used to limit the number of original uploads a user can have
    // listAll(originalsRef)
    // .then((res) => {
    //   console.log(res.items.length);
    //   numberOfOriginals = res.items.length;
    // }).then(() => {
    //   listAll(coversRef)
    //   .then((res) => {
    //     numberOfCovers = res.items.length;
    //     console.log(numberOfOriginals, numberOfCovers);
    //   })
    // }).catch((error) => {
    //   // Uh-oh, an error occurred!
    // });

    if(file.type != 'audio/mpeg'){
      setMessage("File type must be an mp3.");
      file = null;
      return;
    }

    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    let fileNameString = file.name.split('.')[0]
    if(format.test(fileNameString)){
      setMessage("File name cannont contain any special characters")
      file = null;
      return;
    } 

    if(file.size / 1024 / 1024 > 10){
      setMessage("File cannot be more than 10mb")
      file = null;
      return;
    }

    const metadata = {
      contentType: 'audio/mpeg'
    };

    // const storageRef = ref(storage, auth.currentUser.uid + '/covers/' + artist + "/" +  file.name);
    const storageRef = ref(storage, auth.currentUser.uid + '/covers/' + artist + "/" + undashedSong + "/" + file.name);


    // Write the path to the file's location in Storage in the Firestore Database
    const userRef = collection(db, "users/" + artist + "/Originals");
    updateDoc(doc(userRef, undashedSong), {
      // [auth.currentUser.displayName]: auth.currentUser.uid + '/covers/' + artist + "/" + file.name
      [globalUserName]: auth.currentUser.uid + '/covers/' + artist + "/" + undashedSong + "/" + file.name
    });

    let feedMessage = globalUserName + "uid: " + auth.currentUser.uid + " covered " + undashedSong;
    dbSet(dbRef(rtdb, "/activity/" + Date.now()), feedMessage)

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercent(progress)
        // console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            // console.log('Upload is paused');
            break;
          case 'running':
            // console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // console.log("unauthorized")
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // console.log("cancaled")
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // console.log("unknown")
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      }, 
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          setCoverUpload(downloadURL)
        });
      }
    );
  }

  return (
    <div>
      <div className="upload">
        <p>Submit a cover:</p>
        <p>{message}</p>
        {/* <label for="songname">Song Title: </label>
        <input type="text"></input> */}
        <br></br>
        {uploadButton}
        <LoadingBar percent = {percent} />
      </div>
    </div>
  )
}


function LoadingBar(props) {
  if(props.percent > 0 && props.percent < 100){
      return(
          <div>
              <p>Uploading... {Math.round(props.percent)} %</p>
          </div>
      );
  } else if (props.percent ==  100) {
      return(
          <div>
              <p>Upload Complete!</p>
          </div>
      )
  } else {
      return(
          <div></div>
      )
  }
}

export default App;
