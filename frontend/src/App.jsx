import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import NotificationPage from "./pages/NotificationPage"
import FollowerPage from "./pages/FollowerPage";
import FriendsPage from "./pages/FriendsPage";

function App() {
	const user = useRecoilValue(userAtom);
	const { pathname } = useLocation();
	return (
		<Box position={"relative"} w='full' minH="100vh">
			<Container 
				maxW={pathname === "/" ? { base: "100%", sm: "620px", md: "900px", lg: "1200px" } : { base: "100%", sm: "620px", md: "800px" }}
				px={{ base: 4, sm: 6, md: 8 }}
			>
				<Header />
				<Routes>
					<Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
					<Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
					<Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />

					<Route
						path='/:username'
						element={
							user ? (
								<>
									<UserPage />
									<CreatePost />
								</>
							) : (
								<UserPage />
							)
						}
					/>
					<Route path='/:username/post/:pid' element={<PostPage />} />
					<Route path='/:username/friends' element={<FriendsPage />} />
					<Route path='/notifications' element={<NotificationPage/>} />
					<Route path='/followers' element={<FollowerPage/>} />
					<Route path='/chat' element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
					<Route path='/settings' element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
				</Routes>
			</Container>
		</Box>
	);
}

export default App;
