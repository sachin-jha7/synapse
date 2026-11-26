// import { createContext, useContext, useState } from "react";

// const MessageContext = createContext(null);
// export default function MessageProvider({ children }) {
//     type Message = {
//         msg: string;
//         sendBy: string;
//     }
//     type Notification = {
//         msg: string;
//         type: string;
//     }
//     type UserInfo = {
//         userName: string;
//         letters: string;
//         userId: string;
//     }
//     type ChatHistory = {
//         title: string;
//         _id: string;
//     }
//     const [message, setMessage] = useState<Message[]>([]);
//     const [notification, setNotification] = useState<Notification>();
//     const [userInfo, setUserInfo] = useState<UserInfo>(null);
//     const [title, setTitle] = useState<string>(null);
//     const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
//     const [chatId, setChatId] = useState<string>(null);

//     return (
//         <MessageContext.Provider value={{
//             message, setMessage, notification,
//             setNotification, userInfo, setUserInfo, title, setTitle,
//             chatHistory, setChatHistory, chatId, setChatId
//         }} >
//             {children}
//         </MessageContext.Provider>
//     )
// }

// export function useMessage() {
//     const context = useContext(MessageContext);
//     return context;
// }


import {
    createContext,
    useContext,
    useState,
    type ReactNode,
    type Dispatch,
    type SetStateAction
} from "react";

type Message = {
    msg: string;
    sendBy: string;
};

type Notification = {
    msg: string;
    type: string;
};

type UserInfo = {
    userName: string;
    letters: string;
    userId: string;
};

type ChatHistory = {
    title: string;
    _id: string;
};

interface MessageContextType {
    message: Message[];
    setMessage: Dispatch<SetStateAction<Message[]>>;

    notification: Notification | undefined;
    setNotification: Dispatch<SetStateAction<Notification | undefined>>;

    userInfo: UserInfo | null;
    setUserInfo: Dispatch<SetStateAction<UserInfo | null>>;

    title: string | null;
    setTitle: Dispatch<SetStateAction<string | null>>;

    chatHistory: ChatHistory[];
    setChatHistory: Dispatch<SetStateAction<ChatHistory[]>>;

    chatId: string | null;
    setChatId: Dispatch<SetStateAction<string | null>>;
}

const MessageContext = createContext<MessageContextType | null>(null);

export default function MessageProvider({ children }: { children: ReactNode }) {

    const [message, setMessage] = useState<Message[]>([]);
    const [notification, setNotification] = useState<Notification>();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [title, setTitle] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);

    return (
        <MessageContext.Provider value={{
            message,
            setMessage,
            notification,
            setNotification,
            userInfo,
            setUserInfo,
            title,
            setTitle,
            chatHistory,
            setChatHistory,
            chatId,
            setChatId
        }}>
            {children}
        </MessageContext.Provider>
    );
}

export function useMessage(): MessageContextType {
    const context = useContext(MessageContext);

    if (!context) {
        throw new Error("useMessage must be used within MessageProvider");
    }

    return context;
}
