import React from "react";
import "./RightSideBar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";

const RightSideBar = () => {
    return (
        <div className="rs">
           <div className="rs-profile">
            <img src={assets.profile_img} alt="profile" />
            <h3>Richard Sanford <img src={assets.green_dot} className="dot" alt="" /></h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis asperiores earum doloremque laborum odit minima, totam dolor eaque mollitia possimus quaerat repudiandae suscipit illum, voluptatum, nobis aperiam est officiis aspernatur!</p>
            </div>
            <hr />
            <div className="rs-media">
                <p>Media</p>
                <div>
                    <img src={assets.pic1} alt="" />
                    <img src={assets.pic2} alt="" />
                    <img src={assets.pic3} alt="" />
                    <img src={assets.pic4} alt="" />
                    <img src={assets.pic1} alt="" />
                    <img src={assets.pic2} alt="" />
                </div>
            </div>
            <button onClick={() => logout()}>logout</button>
        </div>
    );
};

export default RightSideBar;