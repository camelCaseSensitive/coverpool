import './SongPlayer.css'

function SongPlayer(props) {
    if(props.songSource){
        return (
            <audio controls className="Player">
                <source src={props.songSource} type="audio/mpeg" />
            </audio>
        ) 
    } else {
        return(
            <div></div>
        )
    }
    
}

export default SongPlayer;