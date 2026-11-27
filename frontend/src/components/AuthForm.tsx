import { faCircleNotch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import type { Dispatch, SetStateAction, FormEvent } from "react";
import { useMessage } from "../context/MessageContext";

interface AuthFormProps {
    setIsAuthFormOpen: Dispatch<SetStateAction<boolean>>;
}

type User = {
    name?: string;
    userName: string;
    password: string;
};

type Msgs = {
    msg: string;
    sendBy: string;
};

type ChatHistory = {
    msgs: Msgs[];
    title: string;
    userId: string;
};

type UserInfoForIndex = {
    userName: string;
    letters: string;
    userId: string;
}

export default function AuthForm({ setIsAuthFormOpen }: AuthFormProps) {
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
            setChatHistory(data.threads);
            const userInfo: UserInfoForIndex = {
                userName: data.userName,
                letters: data.letters,
                userId: data.userId
            }
            setUserInfo(userInfo);
        }
    };

    const closeAuthForm = () => {
        setIsAuthFormOpen(false);
    };

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const name = String(formData.get("name") ?? "");
        const userName = String(formData.get("userName") ?? "");
        const password = String(formData.get("password") ?? "");

        if (
            userName.trim() === "" ||
            password.trim() === "" ||
            (formMode === "signup" && name.trim() === "")
        ) {
            return;
        }

        const userInfo: User = {
            ...(formMode === "signup" && { name }),
            userName,
            password,
        };

        setFormSubmissionState("sending");

        try {
            const endpoint = formMode === "login"
                ? "/api/auth/login"
                : "/api/auth/signup";

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userInfo),
                }
            );

            const data = await res.json();

            setFormSubmissionState("submitted");

            if (data.message === "Internal server error") {
                setNotification({
                    msg: "Something went wrong, Try after some time.",
                    type: "error",
                });
                setFormSubmissionState("idle");
                return;
            }

            if (data.message === "Invalid Data") {
                setNotification({
                    msg: "Invalid Input.",
                    type: "error",
                });
                setFormSubmissionState("idle");
                return;
            }

            if (data.message === "Wrong username or password") {
                setNotification({
                    msg: "Wrong username or password.",
                    type: "error",
                });
                setFormSubmissionState("idle");
                return;
            }

            if (data.message === "User already exists") {
                setNotification({
                    msg: "User already exists, Try different username.",
                    type: "error",
                });
                setFormSubmissionState("idle");
                return;
            }

            const isSuccess = formMode === "login"
                ? data.message === "Logged in successfully"
                : data.message === "User created successfully";

            if (isSuccess) {
                const welcomeMessage = formMode === "login"
                    ? `Welcome back ${data.name}.`
                    : `Welcome ${data.name}.`;

                setNotification({
                    msg: welcomeMessage,
                    type: "success",
                });

                setUserInfo({
                    userName: data.name,
                    letters: data.letters,
                    userId: data.userId,
                });

                if (formMode === "login") {
                    getInfo();
                }

                const storedConversation = sessionStorage.getItem("conversation");

                if (storedConversation) {
                    const chatMessages: Msgs[] = JSON.parse(storedConversation);

                    const storedTitle = sessionStorage.getItem("title");

                    const chatTitle: string = storedTitle
                        ? JSON.parse(storedTitle)
                        : "Anonymous";

                    const history: ChatHistory = {
                        msgs: chatMessages,
                        title: chatTitle,
                        userId: data.userId,
                    };

                    const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/chats/claim`,
                        {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(history),
                        }
                    );

                    const result = await res.json();

                    if (result.message === "Chat history preserved") {
                        sessionStorage.clear();

                        setNotification({
                            msg: `${welcomeMessage}\nChat history preserved`,
                            type: "success",
                        });
                    }

                    if (result.message === "No Message to save") {
                        setNotification({
                            msg: "No Message to save",
                            type: "error",
                        });
                    }

                    if (result.message === "Unauthorized") {
                        setNotification({
                            msg: "Unauthorized",
                            type: "error",
                        });
                    }

                    if (result.message === "Interval server error") {
                        setNotification({
                            msg: "Interval server error",
                            type: "error",
                        });
                    }
                }

                closeAuthForm();
            }

        } catch (error) {
            console.error("Authentication error:", error);

            setNotification({
                msg: "Something went wrong, Try after some time.",
                type: "error",
            });

            setFormSubmissionState("idle");
        }
    }

    return (
        <div className="auth-form">
            <button onClick={closeAuthForm} className="close-btn">
                <FontAwesomeIcon icon={faXmark} />
            </button>

            <form onSubmit={handleSubmit}>
                {formMode === "signup" ? (
                    <h2>Create account to save chat</h2>
                ) : (
                    <h2>Login to continue...</h2>
                )}

                {formMode === "signup" && (
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter name..."
                        required
                    />
                )}

                <input
                    type="text"
                    name="userName"
                    placeholder="Enter Username..."
                    required
                />

                <div className="password-field">
                    <input
                        type={isHidden ? "text" : "password"}
                        name="password"
                        placeholder="Password..."
                        required
                    />

                    <button
                        onClick={() => setIsHidden(!isHidden)}
                        type="button"
                    >
                        {isHidden ? "hide" : "show"}
                    </button>
                </div>

                {formSubmissionState === "idle" ? (
                    <button type="submit">Submit</button>
                ) : formSubmissionState === "sending" ? (
                    <button type="button" disabled>
                        Please wait...
                        <FontAwesomeIcon
                            className="force-spin"
                            icon={faCircleNotch}
                        />
                    </button>
                ) : (
                    <button type="button" disabled>
                        Submitted &#10004;
                    </button>
                )}

                {formMode === "login" ? (
                    <p>
                        Don't have an account?
                        <button
                            onClick={() => setFormMode("signup")}
                            type="button"
                        >
                            Signup
                        </button>
                    </p>
                ) : (
                    <p>
                        Already have an account?
                        <button
                            onClick={() => setFormMode("login")}
                            type="button"
                        >
                            Login
                        </button>
                    </p>
                )}
            </form>
        </div>
    );
}
