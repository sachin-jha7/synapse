// import { faXmark } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useMessage } from "../context/MessageContext";

// export default function Notification() {
//     const {notification, setNotification} = useMessage();
//     return (
//         <div style={notification.type === "error" ? {backgroundColor: "#da0d0d26"} : {backgroundColor: "#09835c26"}} className="notification">
//             <p>{notification.msg}</p>
//             <button onClick={() => setNotification(null)}><FontAwesomeIcon icon={faXmark} /></button>
//         </div>
//     )
// }


import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMessage } from "../context/MessageContext";

export default function Notification() {
    const { notification, setNotification } = useMessage();

    if (!notification) return null;

    return (
        <div
            style={
                notification.type === "error"
                    ? { backgroundColor: "#da0d0d26" }
                    : { backgroundColor: "#09835c26" }
            }
            className="notification"
        >
            <p>{notification.msg}</p>

            <button onClick={() => setNotification(undefined)}>
                <FontAwesomeIcon icon={faXmark} />
            </button>
        </div>
    );
}
