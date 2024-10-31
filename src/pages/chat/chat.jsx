import React from "react";
import "./chat.css";
import chatBox from "../../components/chatBox/chatBox";
import leftSidebar from "../../components/leftSideBar/leftSidebar";
import rightSidebar from "../../components/rightSideBar/rightSideBar";

const Chat = () => {
    return (
    <div className="chat">
        <div className="chat-container">
            <leftSidebar/>
            <chatBox/>
            <rightSidebar/>
        </div>
    </div>
    );
};

export default Chat;