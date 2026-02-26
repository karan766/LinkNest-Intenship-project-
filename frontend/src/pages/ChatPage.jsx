import { SearchIcon } from "@chakra-ui/icons";
import { 
  Box, 
  Button, 
  Flex, 
  Input, 
  Skeleton, 
  SkeletonCircle, 
  Text, 
  useColorModeValue, 
  VStack, 
  HStack, 
  Avatar, 
  Badge,
  Icon,
  Divider,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import { FiMessageCircle, FiUsers, FiSearch } from "react-icons/fi";

const ChatPage = () => {
	const [searchingUser, setSearchingUser] = useState(false);
	const [loadingConversations, setLoadingConversations] = useState(true);
	const [loadingFriends, setLoadingFriends] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [friends, setFriends] = useState([]);
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
	const [conversations, setConversations] = useRecoilState(conversationsAtom);
	const currentUser = useRecoilValue(userAtom);
	const showToast = useShowToast();
	const { socket, onlineUsers } = useSocket();

	// AbortController for cancelling requests
	const [abortController, setAbortController] = useState(null);

	// Color mode values
	const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
	const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");
	const textColor = useColorModeValue("gray.800", "gray.100");
	const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
	const hoverBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.1)");

	useEffect(() => {
		const handleMessagesSeen = ({ conversationId }) => {
			setConversations((prev) => {
				const updatedConversations = prev.map((conversation) => {
					if (conversation._id === conversationId) {
						return {
							...conversation,
							lastMessage: {
								...conversation.lastMessage,
								seen: true,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
		};

		socket?.on("messagesSeen", handleMessagesSeen);

		// Cleanup function to remove listener
		return () => {
			socket?.off("messagesSeen", handleMessagesSeen);
		};
	}, [socket, setConversations]);

	useEffect(() => {
		let isMounted = true;
		
		const getConversations = async () => {
			try {
				const res = await fetch("/api/messages/conversations");
				const data = await res.json();
				if (data.error) {
					if (isMounted) showToast("Error", data.error, "error");
					return;
				}
				if (isMounted) setConversations(data);
			} catch (error) {
				if (isMounted) showToast("Error", error.message, "error");
			} finally {
				if (isMounted) setLoadingConversations(false);
			}
		};

		const getFriends = async () => {
			try {
				const res = await fetch("/api/users/friends", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ _id: currentUser._id }),
				});
				const data = await res.json();
				if (data.error) {
					if (isMounted) showToast("Error", data.error, "error");
					return;
				}
				if (isMounted) setFriends(data);
			} catch (error) {
				if (isMounted) showToast("Error", error.message, "error");
			} finally {
				if (isMounted) setLoadingFriends(false);
			}
		};

		getConversations();
		getFriends();

		// Cleanup function
		return () => {
			isMounted = false;
		};
	}, [currentUser._id]); // Removed showToast and setConversations from dependencies

	const handleSearch = (value) => {
		setSearchText(value);
		
		// Clear previous timeout
		if (window.searchTimeout) {
			clearTimeout(window.searchTimeout);
			window.searchTimeout = null;
		}
		
		if (value.length >= 1) {
			window.searchTimeout = setTimeout(() => {
				searchUsers(value);
			}, 300);
		} else {
			setSearchResults([]);
		}
	};

	// Cleanup search timeout on unmount
	useEffect(() => {
		return () => {
			if (window.searchTimeout) {
				clearTimeout(window.searchTimeout);
				window.searchTimeout = null;
			}
		};
	}, []);

	const searchUsers = async (username) => {
		// Cancel previous request if exists
		if (abortController) {
			abortController.abort();
		}

		const controller = new AbortController();
		setAbortController(controller);

		try {
			setSearchingUser(true);
			const res = await fetch("/api/users/Search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, user: currentUser }),
				signal: controller.signal,
			});
			const data = await res.json();
			setSearchResults(data || []);
		} catch (error) {
			if (error.name !== 'AbortError') {
				showToast("Error", error.message, "error");
			}
		} finally {
			setSearchingUser(false);
		}
	};

	const startConversationWithUser = async (user) => {
		try {
			const messagingYourself = user.id === currentUser._id;
			if (messagingYourself) {
				showToast("Error", "You cannot message yourself", "error");
				return;
			}

			const conversationAlreadyExists = conversations.find(
				(conversation) => conversation.participants[0]._id === user.id
			);

			if (conversationAlreadyExists) {
				setSelectedConversation({
					_id: conversationAlreadyExists._id,
					userId: user.id,
					username: user.username,
					userProfilePic: user.profilePic,
				});
				return;
			}

			const mockConversation = {
				mock: true,
				lastMessage: {
					text: "",
					sender: "",
				},
				_id: Date.now(),
				participants: [
					{
						_id: user.id,
						username: user.username,
						profilePic: user.profilePic,
					},
				],
			};
			setConversations((prevConvs) => [...prevConvs, mockConversation]);
			setSelectedConversation({
				_id: mockConversation._id,
				userId: user.id,
				username: user.username,
				userProfilePic: user.profilePic,
			});
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	const handleConversationSearch = async (e) => {
		e.preventDefault();
		if (!searchText.trim()) return;
		
		try {
			const res = await fetch(`/api/users/profile/${searchText}`);
			const searchedUser = await res.json();
			if (searchedUser.error) {
				showToast("Error", searchedUser.error, "error");
				return;
			}
			
			startConversationWithUser({
				id: searchedUser._id,
				username: searchedUser.username,
				profilePic: searchedUser.profilePic,
			});
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return (
		<Box className="animate-fade-in" minH="100vh">
			<Flex
				gap={6}
				flexDirection={{ base: "column", md: "row" }}
				maxW="7xl"
				mx="auto"
				p={4}
			>
				{/* Sidebar */}
				<Box 
					flex={{ base: "none", md: 30 }} 
					bg={cardBg}
					backdropFilter="blur(20px)"
					borderRadius="2xl"
					p={6}
					border="1px solid"
					borderColor={borderColor}
					boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
					h="fit-content"
					position="sticky"
					top="120px"
				>
					<VStack spacing={6} align="stretch">
						{/* Header */}
						<HStack spacing={3}>
							<Icon as={FiMessageCircle} size={24} color="brand.500" />
							<Text fontSize="xl" fontWeight="bold" color="brand.500">
								Messages
							</Text>
						</HStack>
						
						<Divider />
						
						{/* Search */}
						<VStack spacing={3} align="stretch">
							<form onSubmit={handleConversationSearch}>
								<InputGroup>
									<InputLeftElement>
										<Icon as={FiSearch} color="gray.400" />
									</InputLeftElement>
									<Input 
										className="input-modern focus-ring"
										placeholder="Search users..." 
										value={searchText}
										onChange={(e) => handleSearch(e.target.value)} 
									/>
								</InputGroup>
							</form>

							{/* Search Results */}
							{searchText.length > 0 && (
								<Box 
									bg={cardBg}
									backdropFilter="blur(20px)"
									borderRadius="xl"
									p={4}
									border="1px solid"
									borderColor={borderColor}
									boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
									maxH="300px" 
									overflowY="auto"
								>
									<VStack spacing={2} align="stretch">
										{searchingUser && (
											<Text fontSize="sm" color={secondaryTextColor} textAlign="center">
												Searching...
											</Text>
										)}
										{!searchingUser && searchResults.length === 0 && searchText.length > 0 && (
											<Text fontSize="sm" color={secondaryTextColor} textAlign="center">
												No users found
											</Text>
										)}
										{searchResults.map((user, index) => (
											user.username !== currentUser.username && (
												<HStack
													key={index}
													p={3}
													borderRadius="lg"
													cursor="pointer"
													onClick={() => startConversationWithUser(user)}
													className="hover-lift"
													_hover={{ bg: hoverBg }}
												>
													<Avatar size="sm" src={user.profilePic} />
													<VStack align="start" spacing={0} flex={1}>
														<Text fontSize="sm" fontWeight="semibold" color={textColor}>{user.username}</Text>
														<Text fontSize="xs" color={secondaryTextColor}>{user.name}</Text>
													</VStack>
													{user.status === "Friend" && (
														<Badge colorScheme="green" size="sm" className="animate-bounce-in">
															Friend
														</Badge>
													)}
												</HStack>
											)
										))}
									</VStack>
								</Box>
							)}
						</VStack>

						{/* Friends Section */}
						{searchText.length === 0 && (
							<VStack spacing={4} align="stretch">
								<HStack spacing={2}>
									<Icon as={FiUsers} color={secondaryTextColor} />
									<Text fontWeight="semibold" color={secondaryTextColor}>
										Your Friends
									</Text>
								</HStack>
								
								{loadingFriends && (
									<VStack spacing={3}>
										{[0, 1, 2].map((_, i) => (
											<HStack key={i} spacing={3} w="full">
												<SkeletonCircle size="10" />
												<VStack align="start" spacing={1} flex={1}>
													<Skeleton h="3" w="60%" />
													<Skeleton h="2" w="40%" />
												</VStack>
											</HStack>
										))}
									</VStack>
								)}

								{!loadingFriends && friends.length === 0 && (
									<Box 
										bg={cardBg}
										backdropFilter="blur(10px)"
										borderRadius="xl"
										p={8}
										border="1px solid"
										borderColor={borderColor}
										textAlign="center"
									>
										<VStack spacing={3}>
											<Icon as={FiUsers} size={32} color="gray.400" />
											<Text fontSize="sm" color={secondaryTextColor}>
												No friends yet. Add some friends to start chatting!
											</Text>
										</VStack>
									</Box>
								)}

								{!loadingFriends && friends.map((friend, index) => (
									<HStack
										key={index}
										p={3}
										borderRadius="lg"
										cursor="pointer"
										onClick={() => startConversationWithUser({
											id: friend._id,
											username: friend.username,
											profilePic: friend.profilePic,
										})}
										className="hover-lift animate-slide-up"
										style={{ animationDelay: `${index * 0.1}s` }}
										_hover={{ bg: hoverBg }}
									>
										<Box position="relative">
											<Avatar size="md" src={friend.profilePic} />
											{onlineUsers.includes(friend._id) && (
												<Box className="status-online absolute -bottom-1 -right-1" />
											)}
										</Box>
										<VStack align="start" spacing={0} flex={1}>
											<Text fontWeight="semibold" color={textColor}>{friend.username}</Text>
											<Text fontSize="sm" color={secondaryTextColor}>{friend.name}</Text>
										</VStack>
										{onlineUsers.includes(friend._id) && (
											<Badge colorScheme="green" variant="solid" size="sm" className="animate-pulse">
												Online
											</Badge>
										)}
									</HStack>
								))}

								<Divider />

								{/* Recent Conversations */}
								<HStack spacing={2}>
									<Icon as={FiMessageCircle} color={secondaryTextColor} />
									<Text fontWeight="semibold" color={secondaryTextColor}>
										Recent Conversations
									</Text>
								</HStack>

								{loadingConversations && (
									<VStack spacing={3}>
										{[0, 1, 2].map((_, i) => (
											<HStack key={i} spacing={3} w="full">
												<SkeletonCircle size="10" />
												<VStack align="start" spacing={1} flex={1}>
													<Skeleton h="3" w="70%" />
													<Skeleton h="2" w="50%" />
												</VStack>
											</HStack>
										))}
									</VStack>
								)}

								{!loadingConversations && conversations.length === 0 && (
									<Box 
										bg={cardBg}
										backdropFilter="blur(10px)"
										borderRadius="xl"
										p={6}
										border="1px solid"
										borderColor={borderColor}
										textAlign="center"
									>
										<VStack spacing={2}>
											<Icon as={FiMessageCircle} size={24} color="gray.400" />
											<Text fontSize="sm" color={secondaryTextColor}>
												No conversations yet
											</Text>
										</VStack>
									</Box>
								)}

								{!loadingConversations &&
									conversations.map((conversation, index) => (
										<Box
											key={conversation._id}
											className="animate-slide-up"
											style={{ animationDelay: `${index * 0.1}s` }}
										>
											<Conversation
												isOnline={onlineUsers.includes(conversation.participants[0]._id)}
												conversation={conversation}
											/>
										</Box>
									))}
							</VStack>
						)}
					</VStack>
				</Box>
				
				{/* Main Chat Area */}
				<Box flex={{ base: "none", md: 70 }}>
					{!selectedConversation._id ? (
						<Box 
							bg={cardBg}
							backdropFilter="blur(20px)"
							borderRadius="2xl"
							p={20}
							border="1px solid"
							borderColor={borderColor}
							boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
							textAlign="center"
							className="animate-scale-in"
						>
							<VStack spacing={6}>
								<Icon as={GiConversation} size={80} color="gray.400" />
								<VStack spacing={2}>
									<Text fontSize="xl" fontWeight="semibold" color={secondaryTextColor}>
										Select a conversation
									</Text>
									<Text color="gray.400">
										Choose a friend or search for someone to start messaging
									</Text>
								</VStack>
							</VStack>
						</Box>
					) : (
						<Box className="animate-fade-in">
							<MessageContainer />
						</Box>
					)}
				</Box>
			</Flex>
		</Box>
	);
};

export default ChatPage;
