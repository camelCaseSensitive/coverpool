import SongPlayer from './SongPlayer.js';
import ProfileBanner from './ProfileBanner.js'
import LoadingBar from './LoadingBar.js';
import React from 'react';
import './Feed.css'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll} from "firebase/storage";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc} from "firebase/firestore";
import { onAuthStateChanged} from "firebase/auth";

let listed = false;
let bigList = [];
let bigListLength = 0;
let counter = 0;



function Feed(props) {
    console.log("Feed rendered")
    const [myFeed, setMyFeed] = React.useState(null)
    const [profiles, setProfiles] = React.useState(null)

    function getData() {
      bigList = [];
      const storage = getStorage();
      const listRef = ref(storage);
      listAll(listRef)
          .then((res) => {
              res.prefixes.forEach( folder => {
                console.log(folder)
                const listRefSub1 = ref(storage, folder._location.path_ + '/originals')
                listAll(listRefSub1)
                .then((resSub1) => {
                  resSub1.items.forEach((itemRef) => {
                    console.log(itemRef)
                      let filePath = itemRef._location.path_.split('/')
                      getDownloadURL(itemRef).then((url) => {
                          bigList.push(<SongPlayer songSource={url} songName = {filePath[filePath.length-1]} key = {url} />)
                      })
                      .catch((error) => {
                          console.log(error)
                      })
                  })
                }).then(() => {

                })
              })
          }).then(() => {
            listed = true;
            bigListLength = bigList.length;
            setTimeout(() => {setMyFeed(bigList)}, 1000);
          }).catch((error) => {
            console.log("error")
          });
    }

    React.useEffect(() => {
      console.log("This will only run once!")
      getData();
      getDocs(collection(props.db, "users")).then((querySnapshot) => {
        let profs = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc._document.data.value.mapValue.fields);
            let name = doc._document.data.value.mapValue.fields.name.stringValue;
            let pic = doc._document.data.value.mapValue.fields.propic.stringValue;
            console.log(pic)
            profs.push(<ProfileBanner pic={pic} name={name} feed={props.feed} setFeed={props.setFeed} myProfile={props.myProfile} setMyProfile={props.setMyProfile} profile={props.profile} setProfile={props.setProfile}/>)
          });
          if(!profiles) setProfiles(profs)
      })
    }, [])

    if(myFeed){
      return (
        <div>
          <h1>Activity!</h1>
          <ul>
            {profiles}
          </ul>
          <ul>
            {myFeed}
          </ul>
        </div>
      )
    }
    else{
      return(
        <p>Loading...</p>
      )
    }
  }

  export default Feed;