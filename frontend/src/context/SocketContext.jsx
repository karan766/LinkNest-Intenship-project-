import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";
import config from "../config/env.js";

const SocketContext = createContext();

export const useSocket = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const user = useRecoilValue(userAtom);

	useEffect(() => {
		const socketUrl = config.isProduction 
			? (window.location.origin || config.socketUrl) 
			: config.socketUrl;
		const socket = io(socketUrl, {
			query: {
				userId: user?._id,
			},
			transports: config.socketTransports || ['websocket', 'polling'],
			timeout: config.socketTimeout || 20000,
			reconnection: true,
			reconnectionAttempts: config.socketReconnectionAttempts || 5,
			reconnectionDelay: config.socketReconnectionDelay || 1000,
		});

		setSocket(socket);

		socket.on("getOnlineUsers", (users) => {
			setOnlineUsers(users);
		});

		socket.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
		});

		return () => socket && socket.close();
	}, [user?._id]);

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
