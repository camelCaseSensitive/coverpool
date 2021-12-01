import Avatar from './Avatar.js';
import './Navbar.css'

function Navbar(props) {
    return(
        <>
            <div className="Navbar">
                <h1 className="Header" onClick={() => {if(props.feed == false) props.setFeed(true)}}>Coverpool</h1>
                <Avatar signIn={props.signIn} auth={props.auth} provider={props.provider} googleAuth={props.googleAuth} getRedirect={props.getRedirect} propic={props.propic} setPropic={props.setPropic} feed={props.feed} setFeed={props.setFeed}/>
            </div>
            <hr></hr>
        </>
    )
}
export default Navbar;