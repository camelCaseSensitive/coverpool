import propic from './defaultsmall.jpg'
import React from "react"
import {onAuthStateChanged} from "firebase/auth";
import './Avatar.css'

function Avatar(props) {
    console.log("Rendering avatar: " +props.auth.currentUser)
    function handleClick() {
        if(!props.auth.currentUser){
            props.signIn(props.auth, props.provider);
            props.getRedirect(props.auth)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access Google APIs.
                const credential = props.googleAuth.credentialFromResult(result);
                const token = credential.accessToken;
                props.setPropic(props.auth.currentUser.providerData[0].photoURL); 
                // The signed-in user info.
                const user = result.user;
                onAuthStateChanged(props.auth, () => props.setPropic(props.auth.currentUser ? props.auth.currentUser.providerData[0].photoURL : null) );
            }).catch((error) => {
                console.log("There was an error")
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = props.googleAuth.credentialFromError(error);
                // ...
            })
        }
    }
    return(
        <img src={props.propic ? props.propic : propic} className="Avatar" onClick={handleClick}/>
    );
}

export default Avatar;