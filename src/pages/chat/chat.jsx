import React from "react";
import "./chat.css";
import ChatBox from "../../components/ChatBox/ChatBox";
import LeftSidebar from "../../components/LeftSideBar/LeftSidebar.jsx";
import RightSidebar from "../../components/RightSideBar/RightSideBar";

const Chat = () => {
    return (
    <div className="chat">
        <div className="chat-container">
            <LeftSidebar/>
            <ChatBox/>
            <RightSidebar/>
        </div>
    </div>
    );
};

export default Chat;