import React from 'react';
import defPic from './defaultsmall.jpg';
import './ProfileBanner.css';


function ProfileBanner(props) {

    return(
        <div className="ProfileBanner">
            <img src={props.pic} className="ProPic" onClick={() => {if(props.feed == true) props.setFeed(false); if(props.myProfile == true) props.setMyProfile(false); props.setProfile(props.name)}}></img>
            {/* <img src={defPic} className="ProPic"></img> */}
            <p onClick={() => {if(props.feed == true) props.setFeed(false); if(props.myProfile == true) props.setMyProfile(false); window.history.pushState('', '', '/' + props.name + '/'); props.setProfile(props.name)}}>{props.name}</p>
        </div>
    )
  }

  export default ProfileBanner;