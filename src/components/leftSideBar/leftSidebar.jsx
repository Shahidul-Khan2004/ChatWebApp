import  { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {

    const navigate = useNavigate();
    const { userData, chatData } = useContext(AppContext);
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

                if (!querySnapshot.empty && querySnapshot.docs[0].data().id !== userData.id){
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
                messages: [],
            })

            await setDoc(doc(chatsRef, user.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

            await setDoc(doc(chatsRef, userData.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
        } catch (error) {
            toast.error(error.message);
            console.error(error)
        }
    }

    return (
        <div className="ls">
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
                :Array(12).fill("").map((item, index) => (
                    <div key={index} className="friends">
                        <img src={assets.profile_img} alt="profile" />
                        <div>
                            <p>Richard Sanford</p>
                            <span>Online</span>
                        </div>
                    </div>
                ))
                }
            </div>
        </div>
    )
};

export default LeftSidebar