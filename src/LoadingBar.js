import React from "react";
import './LoadingBar.css';

function LoadingBar(props) {
    if(props.percent > 0 && props.percent < 100){
        return(
            <div>
                <p>Uploading... {Math.round(props.percent)} %</p>
            </div>
        );
    } else if (props.percent ==  100) {
        return(
            <div>
                <p>Upload Complete!</p>
            </div>
        )
    } else {
        return(
            <div></div>
        )
    }
    
}

export default LoadingBar;