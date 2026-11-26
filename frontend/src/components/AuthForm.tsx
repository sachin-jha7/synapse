import { faCircleNotch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useMessage } from "../context/MessageContext";

export default function AuthForm({ setIsAuthFormOpen }) {
    type User = {
        name?: string;
        userName: string;
        password: string;
    }
    type Msgs = {
        msg: string;
        sendBy: string;
    }
    type ChatHistory = {
        msgs: Msgs[];
        title: string;
        userId: string;
    }
    const [formMode, setFormMode] = useState<string>("login");
    const [isHidden, setIsHidden] = useState<boolean>(false);
    const [formSubmissionState, setFormSubmissionState] = useState<string>("idle");
    const { setNotification, setUserInfo, setChatHistory } = useMessage();
    const getInfo = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/`, {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        if (data.message === "Unauthorized") {
            setUserInfo(null);
        }
        if (data.message === "user found") {
            // console.log(typeof(data.userId))
            // setUserInfo({ userName: data.userName, letters: data.letters, userId: data.userId });
            setChatHistory(data.threads);
        }
    }
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (formMode === "login") {
            const userName: string = e.target[0].value;
            const password: string = e.target[1].value;
            if (userName === "" || password === "") return;
            const userInfo: User = {
                userName: userName,
                password: password
            }
            setFormSubmissionState("sending");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userInfo)
            });
            const data = await res.json();
            setFormSubmissionState("submitted");
            if (data.message === "Internal server error") {
                setNotification({ msg: "Something went wrong, Try after some time.", type: "error" });
                setFormSubmissionState("idle");
            }
            if (data.message === "Invalid Data") {
                setNotification({ msg: "Invalid Input.", type: "error" });
                setFormSubmissionState("idle");
            }
            if (data.message === "Wrong username or password") {
                setNotification({ msg: "Wrong username or password.", type: "error" });
                setFormSubmissionState("idle");
            }
            if (data.message === "Logged in successfully") {
                setNotification({ msg: `Welcome back ${data.name}.`, type: "success" });
                setUserInfo({ userName: data.name, letters: data.letters });
                getInfo(); // To load threads

                // localStorage.setItem("userInfo", JSON.stringify({userName: data.name, letters: data.letters}));
                if (sessionStorage.getItem("conversation")) {
                    // bring user back to prev chat
                    // save messages to DB
                    const chatMessages = JSON.parse(sessionStorage.getItem("conversation"));
                    const chatTitle = sessionStorage.getItem("title") ? JSON.parse(sessionStorage.getItem("title")) : "Anonymous";
                    const userId = data.userId;
                    const history: ChatHistory = {
                        msgs: chatMessages,
                        title: chatTitle,
                        userId: userId
                    }
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats/claim`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(history)
                    });
                    const result = await res.json();
                    if (result.message === "Chat history preserved") {
                        sessionStorage.clear();
                        setNotification({ msg: `Welcome back ${data.name}.\nChat history preserved`, type: "success" });
                    }
                    if (result.message === "No Message to save") {
                        setNotification({ msg: "No Message to save", type: "error" });
                    }
                    if (result.message === "Unauthorized") {
                        setNotification({ msg: "Unauthorized", type: "error" });
                    }
                    if (result.message === "Interval server error") {
                        setNotification({ msg: "Interval server error", type: "error" });
                    }
                }
                closeAuthForm();
            }
            // console.log(data);
        } else {
            const name: string = e.target[0].value;
            const userName: string = e.target[1].value;
            const password: string = e.target[2].value;
            if (name === "" || userName === "" || password === "") return;
            const userInfo: User = {
                name: name,
                userName: userName,
                password: password
            }
            setFormSubmissionState("sending");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userInfo)
            });
            const data = await res.json();
            setFormSubmissionState("submitted");

            if (data.message === "Internal server error") {
                setNotification({ msg: "Something went wrong, Try after some time.", type: "error" });
                setFormSubmissionState("idle");
            }
            if (data.message === "Invalid Data") {
                setNotification({ msg: "Invalid Input.", type: "error" });
                setFormSubmissionState("idle");
            }
            if (data.message === "User already exists") {
                setNotification({ msg: "User already exists, Try different username.", type: "error" });
                setFormSubmissionState("idle");
            }
            if (data.message === "User created successfully") {
                setNotification({ msg: `Welcome ${data.name}.`, type: "success" });
                setUserInfo({ userName: data.name, letters: data.letters });
                if (sessionStorage.getItem("conversation")) {
                    // bring user back to prev chat
                    // save messages to DB
                    const chatMessages = JSON.parse(sessionStorage.getItem("conversation"));
                    const chatTitle = sessionStorage.getItem("title") ? JSON.parse(sessionStorage.getItem("title")) : "Anonymous";
                    const userId = data.userId;
                    const history: ChatHistory = {
                        msgs: chatMessages,
                        title: chatTitle,
                        userId: userId
                    }
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats/claim`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(history)
                    });
                    const result = await res.json();
                    if (result.message === "Chat history preserved") {
                        sessionStorage.clear();
                        setNotification({ msg: `Welcome ${data.name}.\nChat history preserved`, type: "success" });
                    }
                    if (result.message === "No Message to save") {
                        setNotification({ msg: "No Message to save", type: "error" });
                    }
                    if (result.message === "Unauthorized") {
                        setNotification({ msg: "Unauthorized", type: "error" });
                    }
                    if (result.message === "Interval server error") {
                        setNotification({ msg: "Interval server error", type: "error" });
                    }
                }
                // localStorage.setItem("userInfo", JSON.stringify({userName: data.name, letters: data.letters}));
                closeAuthForm();
            }
            // console.log(data);
        }

    }

    const closeAuthForm = () => {
        setIsAuthFormOpen(false);
    }
    return (

        <div className="auth-form" >
            <button onClick={closeAuthForm} className="close-btn"><FontAwesomeIcon icon={faXmark} /></button>
            <form onSubmit={handleSubmit}>
                {
                    formMode === "signup" ? (
                        <h2>Create account to save chat</h2>
                    ) : (
                        <h2>Login to continue...</h2>
                    )
                }
                {
                    formMode === "signup" ? (
                        <input type="text" placeholder="Enter name..." required />
                    ) : null
                }
                <input type="text" placeholder="Enter Username..." required />
                <div className="password-field">
                    <input type={isHidden ? "text" : "password"} placeholder="Password..." required />
                    <button onClick={() => setIsHidden(!isHidden)} type="button">
                        {isHidden ? "hide" : "show"}
                    </button>
                </div>
                {
                    formSubmissionState === "idle" ? (
                        <button type="submit">Submit</button>
                    ) : formSubmissionState === "sending" ? (
                        <button type="button">Please wait...<FontAwesomeIcon className="force-spin" icon={faCircleNotch} /></button>
                    ) : (
                        <button type="button">Submitted &#10004;</button>
                    )
                }
                {
                    formMode === "login" ? (
                        <p>Don't have an account? <button onClick={() => setFormMode("signup")} type="button">Signup</button></p>
                    ) : (
                        <p>Already have an account? <button onClick={() => setFormMode("login")} type="button">Login</button></p>
                    )
                }
            </form>
        </div>
    )
}