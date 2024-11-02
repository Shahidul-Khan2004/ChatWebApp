import React from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";

const LeftSidebar = () => {
    return(
        <div className="ls">
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} alt="logo" className="logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="menu" />
                        <div className="sub-menu">
                            <p>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="search" />
                    <input type="text" placeholder="Search" />
                </div>
            </div>
            <div className="ls-list">
                {Array(12).fill("").map((item, index) => (
                    <div key={index} className="friends">
                        <img src={assets.profile_img} alt="profile" />
                        <div>
                            <p>Richard Sanford</p>
                            <span>Online</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default LeftSidebar