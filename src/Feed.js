import SongPlayer from './SongPlayer.js';
import LoadingBar from './LoadingBar.js';
import React from 'react';
import './Feed.css'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll} from "firebase/storage";
import { onAuthStateChanged} from "firebase/auth";


function Feed(props) {
      return (
        <div>
          <h1>Activity!</h1>
          <p>Colby uploaded a song</p>
          <p>Kevin just posted a cover!</p>
        </div>
      )
  }

  export default Feed;