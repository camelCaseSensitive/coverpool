import React from 'react';
import defPic from './defaultsmall.jpg';
import './ProfileBanner.css';


function ProfileBanner(props) {

    return(
        <div className="ProfileBanner">
            <img src={props.pic} className="ProPic"></img>
            {/* <img src={defPic} className="ProPic"></img> */}
            <p>{props.name}</p>
        </div>
    )
  }

  export default ProfileBanner;