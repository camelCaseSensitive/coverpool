import SongPlayer from './SongPlayer.js';
import LoadingBar from './LoadingBar.js';
import React from 'react';
import './Feed.css'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll} from "firebase/storage";
import { onAuthStateChanged} from "firebase/auth";


function Feed(props) {
    const storage = getStorage();
    // console.log("storage")
    // console.log(storage)
    const listRef = ref(storage);
    // console.log("listRef")
    // console.log(listRef)

    listAll(listRef)
        .then((res) => {
            res.prefixes.forEach( folder => {
                // console.log(folder._location.path_);
                const listRefSub1 = ref(storage, folder._location.path_ + '/originals')
                listAll(listRefSub1)
                .then((resSub1) => {
                    // console.log(resSub1)
                    resSub1.items.forEach((itemRef) => {
                        // console.log(itemRef)
                        let songPath = itemRef._location.path_.split('/')
                        getDownloadURL(itemRef).then((url) => {
                            // props.setFeaturedSong(<SongPlayer songSource={url} songName = {songPath[songPath.length-1]} key = {url} />)
                            // console.log(song)
                            // if(props.songList.length < res.items.length) props.songList.push(<SongPlayer songSource={url} songName = {songPath[songPath.length-1]} key = {url} />)
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    })
                })
            })
        }).then(() => {

        }).catch((error) => {
          // Uh-oh, an error occurred!
        });

      return (
        <div>
          <h1>Activity!</h1>
          <ul>
            <p></p>
            {props.featuredSong}
          </ul>
        </div>
      )
  }

  export default Feed;