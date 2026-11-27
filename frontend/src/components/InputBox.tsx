import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMessage } from "../context/MessageContext";
import { useState } from "react";

type Message = {
    msg: string;
    sendBy: string;
};

type ChatThread = {
    title: string;
    _id: string;
};

export default function InputBox() {
    const {
        message,
        setMessage,
        userInfo,
        setTitle,
        chatId,
        setChatId,
        setChatHistory,
        setNotification
    } = useMessage();

    const [isTokenLimitHitForGuest, setIsTokenLimitHitForGuest] =
        useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);
        const query = String(formData.get("prompt") ?? "");

        if (query === "") return;
        // console.log(query)
        const newMessage: Message = {
            msg: query,
            sendBy: "user"
        };

        setMessage(prevMessages => [...prevMessages, newMessage]);
        form.reset();

        try {
            // GUEST USER
            if (!userInfo) {
                console.log("****Guest User****");

                const storedConversation =
                    sessionStorage.getItem("conversation");

                const messages: Message[] = storedConversation
                    ? JSON.parse(storedConversation)
                    : [];

                messages.push(newMessage);

                sessionStorage.setItem(
                    "conversation",
                    JSON.stringify(messages)
                );

                // Guest user has already reached token limit
                if (
                    sessionStorage.getItem("summary") ||
                    isTokenLimitHitForGuest ||
                    sessionStorage.getItem("msgAfterTokenLimitHit")
                ) {
                    const storedRemaining =
                        sessionStorage.getItem("msgAfterTokenLimitHit");

                    const remainingMsg: Message[] = storedRemaining
                        ? JSON.parse(storedRemaining)
                        : [];

                    remainingMsg.push(newMessage);

                    const storedSummary = sessionStorage.getItem("summary");

                    let summary: string | null = storedSummary;

                    if (storedSummary) {
                        try {
                            const parsed = JSON.parse(storedSummary);
                            summary = typeof parsed === "string"
                                ? parsed
                                : JSON.stringify(parsed);
                        } catch {
                            summary = storedSummary;
                        }
                    }

                    sessionStorage.setItem(
                        "msgAfterTokenLimitHit",
                        JSON.stringify(remainingMsg)
                    );

                    const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                prompt: query,
                                messages: remainingMsg,
                                summary
                            }),
                            credentials: "include"
                        }
                    );

                    const result = await res.json();

                    const outputMessage: Message = {
                        msg: result.content,
                        sendBy: "system"
                    };

                    messages.push(outputMessage);
                    sessionStorage.setItem(
                        "conversation",
                        JSON.stringify(messages)
                    );

                    remainingMsg.push(outputMessage);

                    sessionStorage.setItem(
                        "msgAfterTokenLimitHit",
                        JSON.stringify(remainingMsg)
                    );

                    setMessage(prevMessages => [
                        ...prevMessages,
                        outputMessage
                    ]);

                    return;
                }

                // Normal guest conversation
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            prompt: query,
                            messages
                        }),
                        credentials: "include"
                    }
                );

                const result = await res.json();

                if (result.message === "token limits hit") {
                    const summary = result.summary;
                    const lastMessages: Message[] = result.lastFewMessages;

                    setIsTokenLimitHitForGuest(true);

                    sessionStorage.setItem(
                        "summary",
                        JSON.stringify(summary)
                    );

                    sessionStorage.setItem(
                        "msgAfterTokenLimitHit",
                        JSON.stringify(lastMessages)
                    );
                }

                const outputMessage: Message = {
                    msg: result.content,
                    sendBy: "system"
                };

                messages.push(outputMessage);

                sessionStorage.setItem(
                    "conversation",
                    JSON.stringify(messages)
                );

                if (result.title) {
                    sessionStorage.setItem(
                        "title",
                        JSON.stringify(result.title)
                    );
                }

                setMessage(prevMessages => [
                    ...prevMessages,
                    outputMessage
                ]);

                return;
            }

            // AUTHENTICATED USER

            if (chatId !== null) {
                // Existing chat
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            prompt: query,
                            userId: userInfo.userId,
                            chatId
                        }),
                        credentials: "include"
                    }
                );

                const result = await res.json();

                if (result.title) {
                    setTitle(result.title);
                }

                if (result.threadId && result.title) {
                    setChatId(result.threadId);

                    const newThread: ChatThread = {
                        title: result.title,
                        _id: result.threadId
                    };

                    setChatHistory(prevHistory => [
                        ...prevHistory,
                        newThread
                    ]);
                }

                const outputMessage: Message = {
                    msg: result.content,
                    sendBy: "system"
                };

                setMessage(prevMessages => [
                    ...prevMessages,
                    outputMessage
                ]);

                return;
            }

            // Create a new chat
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: query,
                        userId: userInfo.userId
                    }),
                    credentials: "include"
                }
            );

            const result = await res.json();

            if (result.title) {
                setTitle(result.title);
            }

            if (result.threadId && result.title) {
                setChatId(result.threadId);

                const newThread: ChatThread = {
                    title: result.title,
                    _id: result.threadId
                };

                setChatHistory(prevHistory => [
                    ...prevHistory,
                    newThread
                ]);
            }

            const outputMessage: Message = {
                msg: result.content,
                sendBy: "system"
            };

            setMessage(prevMessages => [
                ...prevMessages,
                outputMessage
            ]);

        } catch (error) {
            console.error("Chat submission error:", error);

            setNotification({
                msg: "Something went wrong. Please try again.",
                type: "error"
            });
        }
    }

    return (
        <form
            style={
                message.length > 0
                    ? window.innerWidth <= 600
                        ? { top: "81.99%", position: "fixed" }
                        : { top: "80%", position: "fixed" }
                    : { top: "60%" }
            }
            onSubmit={handleSubmit}
            className="input-box"
        >
            <input
                type="text"
                name="prompt"
                placeholder="Ask Synapse"
                autoComplete="off"
            />

            <button className="send-prompt-btn" type="submit">
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
        </form>
    );
}
