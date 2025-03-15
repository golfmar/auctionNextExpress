"use client";
import React, {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import Eye from "@/assets/svg/eye.svg";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import Button from "@/components/ui/Button/Button";
import {useSelector, useDispatch} from "react-redux";
import "./LoginPage.scss";
import {setUser} from "@/app/redux/slices/authSlice";
import {GoogleLogin, CredentialResponse} from "@react-oauth/google";
import Input from "@/components/ui/Input/Input";
// =========================

// =========================

interface SocketData {
    user: {
        _id: string;
        userName: string;
        email: string;
        passwordHash: string;
        avatar: string;
        googleId: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
    token: string;
    message: string;
}

const LoginPage = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const socket = useSelector((state: any) => state.socket.socket);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<{
        email: string;
        password: string;
    }>({
        email: "",
        password: "",
    });
    // =========================

    // =========================
    useEffect(() => {
        if (socket) {
            const handleLoginSuccess = (data: SocketData) => {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
                console.log("===--- user ---====", data.user);
                console.log("===--- token ---====", data.token);
                dispatch(setUser({user: data.user, token: data.token}));
                setSuccessMessage(data.message);
                setOpenModalMessage(true);

                setTimeout(() => {
                    router.replace("/profile");
                    setSuccessMessage("");
                    setOpenModalMessage(false);
                }, 2000);
            };

            socket.on("loginSuccess", handleLoginSuccess);
            socket.on("googleLoginSuccess", (data: SocketData) => {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
                console.log("===--- user ---====", data.user);
                console.log("===--- token ---====", data.token);
                dispatch(setUser({user: data.user, token: data.token}));
                setSuccessMessage("Google login successful");
                setOpenModalMessage(true);
                setTimeout(() => {
                    router.replace("/profile");
                    setSuccessMessage("");
                    setOpenModalMessage(false);
                }, 2000);
            });

            socket.on("loginError", (data: SocketData) => {
                setSuccessMessage(data.message);
                setOpenModalMessage(true);
                setTimeout(() => {
                    setSuccessMessage("");
                    setOpenModalMessage(false);
                    router.replace("/registerPage");
                    // if (data.passwordrequired) {
                    //   navigate(`/setpassword/${data.currentemail}`);
                    // }
                    setEmail("");
                }, 2000);
            });
            socket.on("googleloginError", (data: SocketData) => {
                console.error(data.message, data.error);
                const combinedMessage = `${data.message} - ${data.error}`;
                setSuccessMessage(combinedMessage);
                setOpenModalMessage(true);
                setTimeout(() => {
                    setSuccessMessage("");
                    setOpenModalMessage(false);
                    router.replace("/registerPage");
                }, 2000);
            });

            return () => {
                socket.off("loginSuccess", handleLoginSuccess);
            };
        }
    }, [socket, dispatch, router]);
    // ===============================
    // ===============================
    // ===============================
    const validateForm = () => {
        let isValid = true;
        let errors = {email: "", password: ""};

        if (!email) {
            errors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Email is not valid";
            isValid = false;
        }
        if (!password) {
            errors.password = "Password is required";
            isValid = false;
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters";
            isValid = false;
        }
        setFormErrors(errors);
        return {isValid, errors};
    };
    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const {isValid, errors} = validateForm();
        if (!isValid) {
            console.log("===--- formErrors ---====", formErrors);
            const errorList = Object.values(errors).filter((error) => error !== "");
            const newFormErrors = errorList.join(", ");
            setSuccessMessage(newFormErrors);
            setOpenModalMessage(true);
            setTimeout(() => {
                setSuccessMessage("");
                setOpenModalMessage(false);
            }, 2000);
            return;
        }
        if (socket) {
            socket.emit("login", {email, password});
        }
    };
    // ===============================
    // ===============================
    // ===============================
    const handleGoogleLoginSuccess = (response: CredentialResponse): void => {
        const {credential} = response; // Получаем token от Google
        console.log("Успех:", response);
        // Проверим, что токен существует
        if (!credential) {
            console.error("Google login failed: No credential provided");
            setSuccessMessage("Google login failed");
            setOpenModalMessage(true);
            setTimeout(() => {
                setSuccessMessage("");
                setOpenModalMessage(false);
            }, 5000);
            return;
        }

        // Отправка токена на сервер через сокет
        if (socket) {
            socket.emit("googleLogin", {token: credential});
        }
    };
    const handleGoogleLoginFailure = (): void => {
        console.error("Google login failed:");
        setSuccessMessage("Google login failed");
        setOpenModalMessage(true);
        setTimeout(() => {
            setSuccessMessage("");
            setOpenModalMessage(false);
        }, 2000);
    };
    // ===============================
    // ===============================
    // ===============================
    const passwordInputRef = useRef<HTMLInputElement | null>(null);
    const handlerVisiblePassword = () => {
        if (passwordInputRef.current) {
            passwordInputRef.current.type =
                passwordInputRef.current.type === "password" ? "text" : "password";
        }
    };
    // =========================
    return (
        <div className="">
            <ModalMessage message={successMessage} open={openModalMessage}/>
            <div className="container">
                <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
                    Login
                </h1>
                <form
                    className={` flex flex-col gap-2 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4`}
                >
                    <Input
                        typeInput="email"
                        data="User Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="input-password">
                        <div className="inline-block relative">
                            <Input
                                inputRef={passwordInputRef}
                                typeInput="password"
                                data="User Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Eye
                                className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer opacity-50"
                                onClick={handlerVisiblePassword}
                            ></Eye>
                        </div>
                    </div>

                    {/* Google Login */}
                    <button className="googleLoginButton">
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginFailure}
                        />
                    </button>

                    <Button
                        onClick={(e) => {
                            handleLogin(e);
                        }}
                    >
                        Login
                    </Button>
                </form>
            </div>
        </div>
    );
};
export default LoginPage;
