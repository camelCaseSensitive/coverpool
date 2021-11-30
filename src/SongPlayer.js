import './SongPlayer.css'

function SongPlayer(props) {
    if(props.songSource){
        return (
            <div>
                <p >{props.songName ? props.songName.slice(0,-4) : "unnamed"}</p>
                <audio controls className="Player">
                    <source src={props.songSource} type="audio/mpeg" />
                </audio>
            </div>
        ) 
    } else {
        return(
            <div></div>
        )
    }
    
}

export default SongPlayer;