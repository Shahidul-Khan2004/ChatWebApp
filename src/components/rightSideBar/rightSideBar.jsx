import React, { useContext } from "react";
import "./RightSideBar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const RightSideBar = () => {

    const {chatUser, messages} = useContext(AppContext);

    return chatUser ? (
        <div className="rs">
           <div className="rs-profile">
            <img src={chatUser.userData.avatar} alt="profile" />
            <h3>{Date.now() - chatUser.userData.lastSeen <= 65000 ? <img src={assets.green_dot} className="dot" alt="" /> : null} {chatUser.userData.name}</h3>
            <p>{chatUser.userData.bio}</p>
            </div>
            <hr />
            <button onClick={() => logout()}>logout</button>
        </div>
    )
    : (
        <div className="rs">
            <button onClick={() => logout()}>logout</button>
        </div>
    )
};

export default RightSideBar;