import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {

    const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);

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

                const userIDs = [chatUser.rId,userData.id];

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

    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db,"messages",messagesId), (res) => {
                setMessages(res.data().messages.reverse())
            })
            return () => {
                unSub();
            }
        }
    }, [messagesId])

    return chatUser ? (
        <div className="chat-box">
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="" />
                <p>{chatUser.userData.name} <img src={assets.green_dot} className="dot" alt="" /></p>
                <img src={assets.help_icon} className="help" alt="" />
            </div>


            <div className="chat-msg">
                <div className="s-msg">
                    <p className="msg">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Culpa tenetur maxime ipsam. Accusantium est architecto doloremque sapiente, aperiam velit temporibus, reiciendis error voluptate amet possimus maiores quia, libero voluptates itaque?</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2:30 PM</p>
                    </div>
                </div>
                <div className="s-msg">
                    <img className="msg-img" src={assets.pic1} alt="" />
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2:30 PM</p>
                    </div>
                </div>
                <div className="r-msg">
                    <p className="msg">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Culpa tenetur maxime ipsam. Accusantium est architecto doloremque sapiente, aperiam velit temporibus, reiciendis error voluptate amet possimus maiores quia, libero voluptates itaque?</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2:30 PM</p>
                    </div>
                </div>
            </div>



            <div className="chat-input">
                <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Send a text" />
                <input type="file" id="image" accept="image/png, image/jpeg" hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendMessages} src={assets.send_button} alt="" />
            </div>
        </div>
    )
    : <div className="chat-welcome">
        <img src={assets.logo_icon} alt="" />
        <p>Chat anytime, anywhere</p>
    </div>
};

export default ChatBox;