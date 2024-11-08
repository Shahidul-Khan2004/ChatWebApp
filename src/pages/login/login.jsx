import React, { useState } from "react"
import "./login.css"
import assets from "../../assets/assets"
import { signup } from "../../config/firebase"
import { login } from "../../config/firebase"
import { resetPass } from "../../config/firebase"
const Login = () => {
    const [curState, setCurState] = useState("Sign up");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = (event) => {
        event.preventDefault();
        if (curState === "Sign up") {
            signup(userName, email, password);
        }
        else {
            login(email, password);
        }
    }

    return (
        <div className="login">
            <img src={assets.logo_big} alt="logo" className="logo" />
            <form onSubmit={onSubmitHandler} className="login-form">
                <h2> {curState} </h2>
                {curState === "Sign up" ? <input onChange={(e) => setUserName(e.target.value)} value={userName} type="text" className="form-input" placeholder="Username" required /> : null}
                <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="form-input" placeholder="Email" required />
                <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className="form-input" placeholder="Password" required />
                <button type="submit">{curState === "Sign up" ? "Create Account" : "Login"}</button>
                <div className="login-term">
                    <input type="checkbox" />
                    <p> I agree with terms and conditions & privacy policy</p>
                </div>
                <div className="login-forgot">
                    {curState === "Sign up" ? (
                        <p className="login-toggle">
                            Already have an account?
                            <span onClick={() => setCurState("Login")}> Login</span>
                        </p>
                    ) : (
                        <p className="login-toggle">
                            {"Don't have an account?"}
                            <span onClick={() => setCurState("Sign up")}> Create Account</span>
                        </p>
                    )}
                    {curState === "Login" ? (
                        <p className="login-toggle">
                            Forgot password?
                            <span onClick={() => resetPass(email)}> Reset</span>
                        </p>
                    ) : null}
                </div>

            </form>
        </div>);
};

export default Login;