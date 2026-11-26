import { useState } from "react";
import { useMessage } from "../context/MessageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";


export default function ChatHistory({ isSideBarOpen, setIsSideBarOpen, history, idx, setChatHistory }) {
    const { setMessage, setTitle, setNotification, setChatId } = useMessage();
    const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState<boolean>(false);

    const showChat = async (threadId: string, titleName: string) => {
        // console.log(titleId)
        setIsSideBarOpen(!isSideBarOpen);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats/${threadId}`, {
            method: 'GET',
            credentials: 'include'
        });

        const data = await res.json();
        if (data.message === "here is your message") {
            setMessage(data.Messages);
            setTitle(titleName);
            setChatId(threadId);
        }
        if (data.message === "No Message exists!") {
            setNotification({ msg: "No Message exists!", type: "error" });
            setChatId(null);
        }
        if (data.message === "Interval server error") {
            setNotification({ msg: "Interval server error", type: "error" });
            setChatId(null);
        }
    }

    const deleteChat = async (e: React.MouseEvent<HTMLButtonElement>, threadId: string) => {
        e.stopPropagation();
        // console.log(threadId);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats/${threadId}`, {
            method: "DELETE",
            credentials: "include"
        });
        const data = await res.json();
        if (data.message === "Deleted") {
            setNotification({ msg: "Deleted!", type: "success" });
            setChatHistory((prevHistory) => prevHistory.filter((item) => item._id !== threadId));
            setTitle(null);
            setMessage([]);
        }
        if (data.message === "Interval server error") {
            setNotification({ msg: "Couldn't delete item. Please try again later.", type: "error" });
        }
    }

    return (
        <div onClick={() => showChat(history._id, history.title)} key={idx} className="recent-chat">
            <p className="text">{history.title}</p>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setIsDeleteDialogueOpen(true);
            }} className="history-del-btn">
                <FontAwesomeIcon icon={faTrashCan} />
            </button>
            {
                isDeleteDialogueOpen ? (
                    <div className="del-btns">
                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            setIsDeleteDialogueOpen(false);
                        }}
                        >cancel</button>
                        <button onClick={(e) => deleteChat(e, history._id)} id={history._id} className="del-btn">delete</button>
                    </div>
                ) : null
            }
        </div>
    )
}