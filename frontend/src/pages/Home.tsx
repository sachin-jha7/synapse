import { faBarsStaggered, faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMessage } from "../context/MessageContext";
import BotMessage from "../components/BotMessage";
import InputBox from "../components/InputBox";
import AuthForm from "../components/AuthForm";
import { useEffect, useRef, useState } from "react";
import Notification from "../components/Notification";
import ChatHistory from "../components/ChatHistory";


export default function Home() {

    const { message, notification, userInfo, setNotification,
        setUserInfo, setMessage, title, setTitle, chatHistory, setChatHistory, setChatId } = useMessage();



    const [isAuthFormOpen, setIsAuthFormOpen] = useState<boolean>(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

    const logout = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        if (data.message === "Logged out successfully") {
            setNotification({ msg: "You're successfully logged out", type: "success" });
            setUserInfo(null);
            setMessage([]);
            setChatHistory([]);
            setTitle(null);
            localStorage.removeItem("userInfo");
        }
    }

    // useEffect(() => {
    //     if (sessionStorage.getItem("conversation")) {
    //         setMessage(JSON.parse(sessionStorage.getItem("conversation")));
    //     }
    // }, []);
    useEffect(() => {
        const conversation = sessionStorage.getItem("conversation");

        if (conversation) {
            setMessage(JSON.parse(conversation));
        }
    }, []);

    const openNewChat = () => {
        if (!userInfo) {
            setNotification({ msg: "You're not logged-in!", type: "error" });
            return;
        }
        setMessage([]);
        setTitle(null);
        setChatId("New Chat");
    }



    useEffect(() => {
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
                setUserInfo({ userName: data.userName, letters: data.letters, userId: data.userId });
                setChatHistory(data.threads);
            }
        }
        getInfo();
    }, []);





    // Scroll the chat screen at bottom
    // const bottomRef = useRef(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        if (message.length > 0 && message[message.length - 1].sendBy === "user") {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }

    }, [message]);

    return (
        <div className="main">
            <div style={window.innerWidth <= 800 ? isSideBarOpen ? { left: "0" } : { left: "-100%" } : { position: "relative" }} className="left-section">
                <div className="brand">
                    <p className="logo">Synapse</p>
                    {window.innerWidth <= 800 ? (
                        <button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    ) : null}
                </div>
                <div onClick={openNewChat} className="new-chat-btn">
                    <FontAwesomeIcon icon={faPenToSquare} /> New chat
                </div>
                <div className="chat-history">
                    <h3 >recents</h3>
                    <div className="history-collection">

                        {
                            chatHistory.map((history, idx) => {
                                return (
                                    <ChatHistory key={idx} history={history} setChatHistory={setChatHistory}
                                        idx={idx} isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
                                )
                            })
                        }

                        {/* <div className="recent-chat">
                            <p className="text">Dashboard UI/UX improvment...</p>
                            <button className="history-del-btn">
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </div> */}
                    </div>
                </div>
                <div className="profile">
                    <div className="img">
                        {/* <img src="https://i.pinimg.com/474x/69/d4/54/69d454b78c426f54b8ab301a95e38be8.jpg" alt="" /> */}
                        {userInfo ? <p >{userInfo.letters}</p> : <p>?</p>}
                    </div>
                    <p className="username">
                        {userInfo ? userInfo.userName : ":)"}
                    </p>
                </div>
            </div>
            <div className="right-section">
                <div className="top-nav">
                    {
                        window.innerWidth <= 800 ? (
                            <button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
                                <FontAwesomeIcon icon={faBarsStaggered} />
                            </button>
                        ) : null
                    }

                    <h3>
                        {/* {title ?? (() => {
                            const storedTitle = sessionStorage.getItem("title");

                            return storedTitle
                                ? JSON.parse(storedTitle)
                                : null;
                        })()} */}
                        {
                            title ? title : JSON.parse(sessionStorage.getItem("title"))
                        }
                    </h3>

                    {userInfo ? (
                        <button className="logout-btn" onClick={logout}>Logout</button>
                    ) : (
                        <button onClick={() => setIsAuthFormOpen(!isAuthFormOpen)}>Login</button>
                    )}

                </div>
                <div className="chat-box">
                    {message.length == 0 && <h1 className="start-header">What should we explore?</h1>}
                    <div className="msg-box">
                        {
                            message.map((data, idx, arr) => {
                                return (
                                    data.sendBy === "user" ? (
                                        idx === arr.length - 1 ? <div key={idx} className="user-msg-wrapper">
                                            <div className="right-msg-glow animated-glow">
                                                <div className="right-msg">{data.msg}</div>
                                            </div>
                                        </div>
                                            : <div key={idx} className="user-msg-wrapper">
                                                <div className="right-msg-glow">
                                                    <div className="right-msg">{data.msg}</div>
                                                </div>
                                            </div>
                                    ) : (
                                        <BotMessage key={idx} msg={data.msg} idx={idx} />
                                    )
                                )
                            })
                        }
                        <div ref={bottomRef} />
                    </div>

                    {
                        <InputBox />
                    }


                </div>
                <div className="footer">
                    <p>
                        Synapse. v0 &copy; 2026 <a href="https://sachin-ten-ruby.vercel.app/">Sachin</a>
                    </p>
                </div>
            </div>
            {
                isAuthFormOpen && <AuthForm setIsAuthFormOpen={setIsAuthFormOpen} />
            }
            {notification && <Notification />}
        </div>
    )
}
