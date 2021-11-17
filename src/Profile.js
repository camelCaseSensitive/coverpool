import SongPlayer from './SongPlayer.js';
import './Profile.css'

function Profile(props) {
    let covers = <p>No covers yet.</p>
    if (props.propic){
      return (
        <div>
          <div className="Profile">
            <div><img src={props.propic ? props.propic : null} /></div>
            <div className="ProfileDetails">
                <h1 className="Username">{props.auth.currentUser.providerData[0].displayName}</h1>
                <p className="UserDetail">Originals: 1</p>
                <p className="UserDetail">Covers: 0</p>
                <p className="UserDetail">Strikes: 0</p>
            </div>
          </div>
          <h2>Originals</h2>
          <p>College</p>
          <SongPlayer songSource={props.songSource} />
          <h2>Covers</h2>
          {covers}
        </div>
      )
    } else {
      return (<div>Not logged in.</div>)
    }
  }

  export default Profile;