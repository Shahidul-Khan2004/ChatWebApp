import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import ReactLinkify from "react-linkify";

const ChatBox = () => {

    const { userData, messagesId, chatUser, messages, setMessages , setChatVisible, chatVisible } = useContext(AppContext);

    const [input, setInput] = useState("");

    const sendMessages = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, "messages", messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                })

                const userIDs = [chatUser.rId, userData.id];

                userIDs.forEach(async (id) => {
                    const userChatRef = doc(db, "Chats", id);
                    const userChatSnapshot = await getDoc(userChatRef);

                    if (userChatSnapshot.exists()) {
                        const userChatData = userChatSnapshot.data();
                        const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messagesId);
                        userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);
                        userChatData.chatData[chatIndex].updatedAt = Date.now();
                        if (userChatData.chatData[chatIndex].rId === userData.id) {
                            userChatData.chatData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatRef, {
                            chatData: userChatData.chatData
                        })
                    }
                })

            }
        } catch (error) {
            toast.error(error.message);
        }
        setInput("");
    }

    const convertTimeStamp = (timestamp) => {
        let date = timestamp.toDate();
        const hour = date.getHours();
        const minutes = date.getMinutes();
        if (hour > 12) {
            return hour - 12 + ":" + minutes + " PM";
        }
        else {
            return hour + ":" + minutes + " AM";
        }
    }

    const linkifyDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank" rel="noopener noreferrer" className="link">
            {text}
        </a>
    );

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessages();
        }
    };

    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
                setMessages(res.data().messages.reverse())
            })
            return () => {
                unSub();
            }
        }
    }, [messagesId])

    return chatUser ? (
        <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="" />
                <p>{chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen <= 65000 ? <img src={assets.green_dot} className="dot" alt="" /> : null}</p>
                <img onClick={() => setChatVisible(false)} src={assets.arrow_icon} className="arrow" alt="" />
            </div>


            <div className="chat-msg">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                        <ReactLinkify componentDecorator={linkifyDecorator}>
                            <p className="msg">{msg.text}</p>
                        </ReactLinkify>
                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                            <p>{convertTimeStamp(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
            </div>



            <div className="chat-input">
                <input onKeyDown={handleKeyDown} onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Send a text" />
                <img onClick={sendMessages} src={assets.send_button} alt="" />
            </div>
        </div>
    )
        : <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
            <img src="red-chat-logo.png" alt="" />
            <p>Chat anytime, anywhere</p>
        </div>
};

export default ChatBox;