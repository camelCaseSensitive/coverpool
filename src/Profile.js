import SongPlayer from './SongPlayer.js';
import LoadingBar from './LoadingBar.js';
import React from 'react';
import './Profile.css'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll} from "firebase/storage";
import { onAuthStateChanged} from "firebase/auth";

//TODO:
// When user logs in add their pro-pic link and display name to files under their uid.
// Use these files to populate the users profile so that it can be accessed by another user
// Also use this for the home feed


function Profile(props) {
    let covers = <p>No covers yet.</p>
    const [percent, setPercent] = React.useState(null);
    const [originalUpload, setOriginalUpload] = React.useState(null);
    const [songName, setSongName] = React.useState(null);
    const [mySongs, setMySongs] = React.useState(null);
    const [numberOfOriginals, setNumberOfOriginals] = React.useState(null);

    let songsComponentArray = [];

    React.useEffect(() => {
      console.log("Profile noticed an auth change")
      const storage = getStorage();
      const listRef = ref(storage, props.auth.currentUser.uid + '/originals');
      listAll(listRef)
      .then((res) => {
        setNumberOfOriginals(res.items.length);
        res.items.forEach((itemRef) => {
          let songPath = itemRef._location.path_.split('/')
          getDownloadURL(itemRef).then((url) => {
            songsComponentArray.push(<SongPlayer songSource={url} songName = {songPath[songPath.length-1]} key = {url} />);
          })
          .then(() => {
            if(songsComponentArray.length == res.items.length){
              // console.log(songsComponentArray)
              setMySongs(songsComponentArray)
            } 
          })
          .catch((error) => {
            console.log(error)
          })
        });
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });
    }, [props.auth.currentUser]);

    
  
    function handleFile(e){
      let file = e.target.files[0];
      setSongName(file.name);
      const storage = getStorage();

      const metadata = {
        contentType: 'audio/mpeg'
      };

      const storageRef = ref(storage, props.auth.currentUser.uid + '/originals/' + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPercent(progress)
          // console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
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
              console.log("unauthorized")
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              console.log("cancaled")
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
            console.log('File available at', downloadURL);
            setOriginalUpload(downloadURL)
          });
        }
      );
    }

    if (props.propic){
      return (
        <div>
          <div className="Profile">
            <div><img src={props.propic ? props.propic : null} /></div>
            <div className="ProfileDetails">
                <h1 className="Username">{props.auth.currentUser.providerData[0].displayName}</h1>
                <p className="UserDetail">Originals: {numberOfOriginals}</p>
                <p className="UserDetail">Covers: 0</p>
                <p className="UserDetail">Strikes: 0</p>
            </div>
          </div>
          <h2>Originals</h2>
          <ul>
            {mySongs}
          </ul>
          <SongPlayer songSource={originalUpload} songName = {songName} />
          <div className="upload">
            <p>Upload an original:</p>
            <input type="file" id="myFile" allow="audio/mp3" name="filename" onChange={(e) => handleFile(e)}></input>
            <LoadingBar percent = {percent} />
          </div>
          
          <h2>Covers</h2>
          {covers}
        </div>
      )
    } else {
      return (<div>Not logged in.</div>)
    }
  }

  export default Profile;