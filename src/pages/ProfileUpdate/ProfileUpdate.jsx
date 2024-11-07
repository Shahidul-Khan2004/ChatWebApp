import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const ProfileUpdate = () => {

    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [uid, setUid] = useState("");
    const [prevImage, setPrevImage] = useState("");
    const {setUserData} = useContext(AppContext);

    const updateProfile = async (event) => {
        event.preventDefault();
        try {
            const docRef = doc(db, "users", uid);
            if (prevImage) {
                await updateDoc(docRef, {
                    avatar: prevImage,
                    name: name,
                    bio: bio
                })
            }
            else {
                await updateDoc(docRef, {
                    name: name,
                    bio: bio
                })
            }
            const snap = await getDoc(docRef);
            setUserData(snap.data());
            navigate("/chat");
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    }


    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUid(user.uid)
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.data().avatar) {
                    setPrevImage(docSnap.data().avatar);
                }
                if (docSnap.data().name) {
                    setName(docSnap.data().name);
                }
                if (docSnap.data().bio) {
                    setBio(docSnap.data().bio);
                }
            }
            else {
                navigate("/")
            }
        })
    })

    return (
        <div className="profile">
            <div className="profile-container">
                <form onSubmit={updateProfile}>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <img src={prevImage ? prevImage : assets.avatar_icon} alt="" />
                        <input onChange={(e) => setPrevImage(e.target.value)} value={prevImage} type="text" placeholder="Paste Direct Image Link" />
                    </label>
                    <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Name" required />
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder="Bio" required></textarea>
                    <button type="submit">Save</button>
                </form>
                <img className="profile-pic" src={prevImage ? prevImage : "red-chat-logo.png"} alt="" />
            </div>
        </div>
    );
};

export default ProfileUpdate;   