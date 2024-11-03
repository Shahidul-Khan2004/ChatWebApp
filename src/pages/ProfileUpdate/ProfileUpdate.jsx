import React, { useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";

const ProfileUpdate = () => {

    const [image, setImage] = useState(false);

    return (
        <div className="profile">
            <div className="profile-container">
                <form>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="avatar" accept=".png, .jpg, .jpeg" hidden/>
                        <img src= {image? URL.createObjectURL(image):assets.avatar_icon} alt="" />
                        upload profile image
                    </label>
                    <input type="text" placeholder="Name" required />
                    <textarea placeholder="Bio" required></textarea>
                    <button type ="submit">Save</button>
                </form>
                <img className="profile-pic"src="red-chat-logo.png" alt="" />
            </div>
        </div>
    );
};

export default ProfileUpdate;   