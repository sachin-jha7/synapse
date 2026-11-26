import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMessage } from "../context/MessageContext";
import { useState } from "react";
// import { useState } from "react";

export default function InputBox() {
    type Message = {
        msg: string;
        sendBy: string;
    }
    const { message, setMessage, userInfo, setTitle, chatId, setChatId, setChatHistory } = useMessage();
    const [isTokenLimitHitForGuest, setIsTokenLimitHitForGuest] = useState<boolean>(false);
    // const [isTokenLimitHit, setIsTokenLimitHit] = useState<boolean>(false);
    // const [query, setQuery] = useState<string>("");


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        let query: string = e.target[0].value;

        if (e.target[0].value === "") return;

        const newMessage: Message = {
            msg: query,
            sendBy: "user",
        };

        // type Message = {
        //     msg: string;
        //     sendBy: string;
        // }
        setMessage((prevMessages) => [...prevMessages, newMessage]);
        e.target[0].value = "";

        if (!userInfo) {
            console.log("****Guest User****");
            let messages: Message[] = sessionStorage.getItem("conversation") ? JSON.parse(sessionStorage.getItem("conversation")) : [];
            messages.push({ msg: query, sendBy: "user" });
            // localStorage.setItem("conversation", JSON.stringify(messages));
            sessionStorage.setItem("conversation", JSON.stringify(message));
            if (sessionStorage.getItem("summary") || isTokenLimitHitForGuest || sessionStorage.getItem("msgAfterTokenLimitHit")) {
                const remainingMsg = sessionStorage.getItem("msgAfterTokenLimitHit") ? JSON.parse(sessionStorage.getItem("msgAfterTokenLimitHit")) : [];
                remainingMsg.push({ msg: query, sendBy: "user" });
                const summary = sessionStorage.getItem("summary") ? sessionStorage.getItem("summary") : null;
                sessionStorage.setItem("msgAfterTokenLimitHit", JSON.stringify(remainingMsg));
                const res = await fetch("http://localhost:3000/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt: query, userId: userInfo?.userId, messages: remainingMsg, summary }),
                    credentials: "include"
                });
                const result = await res.json();
                const outputMessage: Message = {
                    msg: result.content,
                    sendBy: "system"
                }
                // messages.push({ msg: query, sendBy: "user" });
                // localStorage.setItem("conversation", JSON.stringify(messages));
                // sessionStorage.setItem("conversation", JSON.stringify(messages));
                messages.push({ msg: result.content, sendBy: "system" });
                sessionStorage.setItem("conversation", JSON.stringify(messages));
                remainingMsg.push({ msg: result.content, sendBy: "system" });
                sessionStorage.setItem("msgAfterTokenLimitHit", JSON.stringify(remainingMsg));
                setMessage((prevMessages) => [...prevMessages, outputMessage]);
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: query, userId: userInfo?.userId, messages }),
                credentials: "include"
            });

            const result = await res.json();
            if (result.message === "token limits hit") {
                const summary = result.summary;
                const lastMessages = result.lastFewMessages;
                setIsTokenLimitHitForGuest(true);
                sessionStorage.setItem("summary", JSON.stringify(summary));
                sessionStorage.setItem("msgAfterTokenLimitHit", JSON.stringify(lastMessages));
            }
            const outputMessage: Message = {
                msg: result.content,
                sendBy: "system"
            }
            messages.push({ msg: result.content, sendBy: "system" });
            // messages.push({ msg: query, sendBy: "user" });

            sessionStorage.setItem("conversation", JSON.stringify(messages));
            if (result.title) {
                sessionStorage.setItem("title", JSON.stringify(result.title));
            }
            setMessage((prevMessages) => [...prevMessages, outputMessage]);
        } else {
            // console.log("User is logged in");
            // console.log(typeof(userInfo.userId))
            if (chatId !== null) {
                // User either clicked on existing chat or on new chat button
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt: query, userId: userInfo.userId, chatId }),
                    credentials: "include"
                });
                const result = await res.json();
                if (result.title) {
                    setTitle(result.title);
                }
                if(result.threadId) {
                    setChatId(result.threadId);
                    const newThread = { title: result.title, _id: result.threadId };
                    setChatHistory(prevHistory => [...prevHistory, newThread]);
                }
                const outputMessage: Message = {
                    msg: result.content,
                    sendBy: "system"
                }
                setMessage((prevMessages) => [...prevMessages, outputMessage]);
                return;
            }
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: query, userId: userInfo.userId }),
                credentials: "include"
            });


            const result = await res.json();

            if (result.title) {
                setTitle(result.title);

            }
            if (result.threadId) {
                setChatId(result.threadId);
                const newThread = { title: result.title, _id: result.threadId };
                setChatHistory(prevHistory => [...prevHistory, newThread]);
            }
            const outputMessage: Message = {
                msg: result.content,
                sendBy: "system"
            }
            setMessage((prevMessages) => [...prevMessages, outputMessage]);
        }
    }
    return (
        <form style={message.length > 0 ? window.innerWidth <= 600 ? { top: "81.99%", position: "fixed" } : { top: "80%", position: "fixed" } : { top: "60%" }}
            onSubmit={handleSubmit} className="input-box">
            <input type="text" placeholder="Ask Synapse" />
            <button className="send-prompt-btn">
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
        </form>
    )
}