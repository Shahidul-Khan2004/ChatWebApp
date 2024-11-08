import { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {

    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, "users");
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty && querySnapshot.docs[0].data().id !== userData.id) {
                    let userExists = false;
                    chatData.map((user) => {
                        if (user.rId === querySnapshot.docs[0].data().id) {
                            userExists = true;
                        }
                    })

                    if (!userExists) {
                        setUser(querySnapshot.docs[0].data());
                    }
                }
                else {
                    setUser(null);
                }
            }
            else {
                setShowSearch(false);
            }

        } catch (error) {
            toast.error(error.message);
            console.error(error)
        }
    }

    const addChat = async () => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "Chats");
        try {
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(chatsRef, user.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

            await updateDoc(doc(chatsRef, userData.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

            const uSnap = await getDoc(doc(db, "users", user.id));
            const uData = uSnap.data();
            setChat({
                messagesId: newMessageRef.id,
                lastMessage: "",
                rId: userData.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            })
            setShowSearch(false);
            setChatVisible(true);

        } catch (error) {
            toast.error(error.message);
            console.error(error)
        }
    }

    const setChat = async (item) => {
        try {
            setMessagesId(item.messageId);
            setChatUser(item)
            const userChatsRef = doc(db, "Chats", userData.id);
            const userChatSnapshot = await getDoc(userChatsRef);
            const userChatData = userChatSnapshot.data();
            const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === item.messageId);
            userChatData.chatData[chatIndex].messageSeen = true;
            await updateDoc(userChatsRef, {
                chatData: userChatData.chatData
            })
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
        }

    }

    useEffect(() => {
        
        const updateChatUserData = async () => {
            if (chatUser) {
                const userRef = doc(db, "users", chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev => ({...prev, userData: userData}));
            }
        }

        updateChatUserData();

    },[chatData])

    return (
        <div className={`ls ${chatVisible ? "hidden" : ""}`}>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} alt="logo" className="logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="menu" />
                        <div className="sub-menu">
                            <p onClick={() => navigate("/profile")}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="search" />
                    <input onChange={inputHandler} type="text" placeholder="Search" />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user
                    ? <div onClick={addChat} className="friends add-user">
                        <img src={user.avatar} />
                        <p>{user.name}</p>
                    </div>
                    : chatData.map((item, index) => (
                        <div
                            onClick={() => setChat(item)} key={index}
                            className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
                            <img src={item.userData.avatar} alt="profile" />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
};

export default LeftSidebar