import { createContext, useContext, useState } from "react";

const MessageContext = createContext(null);
export default function MessageProvider({ children }) {
    type Message = {
        msg: string;
        sendBy: string;
    }
    type Notification = {
        msg: string;
        type: string;
    }
    type UserInfo = {
        userName: string;
        letters: string;
        userId: string;
    }
    type ChatHistory = {
        title: string;
        _id: string;
    }
    const [message, setMessage] = useState<Message[]>([]);
    const [notification, setNotification] = useState<Notification>();
    const [userInfo, setUserInfo] = useState<UserInfo>(null);
    const [title, setTitle] = useState<string>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [chatId, setChatId] = useState<string>(null);

    return (
        <MessageContext.Provider value={{
            message, setMessage, notification,
            setNotification, userInfo, setUserInfo, title, setTitle,
            chatHistory, setChatHistory, chatId, setChatId
        }} >
            {children}
        </MessageContext.Provider>
    )
}

export function useMessage() {
    const context = useContext(MessageContext);
    return context;
}