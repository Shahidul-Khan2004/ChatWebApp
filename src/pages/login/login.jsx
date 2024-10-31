import React, { useState } from "react";
import "./login.css";
import assets from "../../assets/assets";
const Login = () => {
    const [curState, setCurState] = useState("Sign up");
    return (
    <div className="login">
        <img src={assets.logo_big} alt="logo" className="logo" />
        <from className="login-form">
            <h2> {curState} </h2>
            {curState === "Sign up"?<input type="text" className="form-input" placeholder="Username" required/>:null}
            <input type="email" className="form-input" placeholder="Email" required/>
            <input type="password" className="form-input" placeholder="Password" required/>
            <button type="submit">{curState === "Sign up"?"Create Account":"Login"}</button>
            <div className="login-term">
                <input type="checkbox" />
                <p> I agree with terms and conditions & privacy policy</p>
            </div>
            <div className="login-forgot">
                { curState === "Sign up"?
                    <p className="login-toggle">Already have an account? 
                    <span onClick={() => setCurState("Login")}> Login</span></p>
                    :<p className="login-toggle">Don't have an account? 
                    <span onClick={() => setCurState("Sign up")}> Create Account</span></p>
                }
            </div>
        </from>
    </div>);
};

export default Login;