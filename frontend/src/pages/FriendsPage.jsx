import {
	Box,
	Flex,
	Text,
	Avatar,
	Button,
	VStack,
	HStack,
	Spinner,
	useColorModeValue,
	Icon,
	Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const FriendsPage = () => {
	const { username } = useParams();
	const navigate = useNavigate();
	const showToast = useShowToast();
	const currentUser = useRecoilValue(userAtom);
	const [friends, setFriends] = useState([]);
	const [loading, setLoading] = useState(true);
	const [profileUser, setProfileUser] = useState(null);

	// Color mode values
	const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
	const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");
	const textColor = useColorModeValue("gray.800", "gray.100");
	const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
	const hoverBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.1)");

	useEffect(() => {
		const getFriends = async () => {
			try {
				setLoading(true);
				const res = await fetch(`/api/users/profile/${username}`);
				const userData = await res.json();
				
				if (userData.error) {
					showToast("Error", userData.error, "error");
					return;
				}
				
				setProfileUser(userData);

				// Get friends details
				const friendsRes = await fetch(`/api/users/friends/${userData._id}`);
				
				if (!friendsRes.ok) {
					const errorText = await friendsRes.text();
					throw new Error(`HTTP ${friendsRes.status}: ${errorText}`);
				}
				
				const friendsData = await friendsRes.json();
				
				if (friendsData.error) {
					showToast("Error", friendsData.error, "error");
					return;
				}
				
				setFriends(friendsData);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};

		getFriends();
	}, [username, showToast]);

	const FriendCard = ({ friend }) => {
		const isCurrentUser = currentUser?._id === friend._id;

		return (
			<Flex
				p={4}
				align="center"
				justify="space-between"
				className="hover-lift"
				borderRadius="lg"
				transition="all 0.2s"
				_hover={{ bg: hoverBg }}
			>
				<HStack spacing={3} flex={1}>
					<Avatar
						size="md"
						src={friend.profilePic}
						name={friend.name}
						className="hover-glow"
					/>
					<VStack align="start" spacing={0}>
						<Text
							fontWeight="semibold"
							fontSize="md"
							color={textColor}
							as={RouterLink}
							to={`/${friend.username}`}
							_hover={{ color: "brand.500" }}
							cursor="pointer"
						>
							{friend.username}
						</Text>
						<Text fontSize="sm" color={secondaryTextColor}>
							{friend.name}
						</Text>
						{friend.bio && (
							<Text fontSize="xs" color="gray.400" noOfLines={1}>
								{friend.bio}
							</Text>
						)}
					</VStack>
				</HStack>
			</Flex>
		);
	};

	if (loading) {
		return (
			<Flex justify="center" align="center" minH="50vh">
				<Spinner size="xl" color="brand.500" />
			</Flex>
		);
	}

	return (
		<Box className="animate-fade-in" maxW="600px" mx="auto" p={4}>
			{/* Header */}
			<Flex
				align="center"
				mb={6}
				p={4}
				bg={cardBg}
				backdropFilter="blur(20px)"
				borderRadius="2xl"
				border="1px solid"
				borderColor={borderColor}
				boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(`/${username}`)}
					leftIcon={<FiArrowLeft />}
					mr={3}
					className="hover-lift"
				>
					Back
				</Button>
				<VStack align="start" spacing={1} flex={1}>
					<HStack>
						<Icon as={FiUsers} color="brand.500" />
						<Text fontSize="xl" fontWeight="bold" color="brand.500">
							Friends
						</Text>
					</HStack>
					<Text fontSize="sm" color={secondaryTextColor}>
						{profileUser?.name}'s friends ({friends.length})
					</Text>
				</VStack>
			</Flex>

			{/* Friends List */}
			<Box
				bg={cardBg}
				backdropFilter="blur(20px)"
				borderRadius="2xl"
				border="1px solid"
				borderColor={borderColor}
				boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
				overflow="hidden"
			>
				{friends.length === 0 ? (
					<Flex
						direction="column"
						align="center"
						justify="center"
						py={12}
						px={6}
					>
						<Icon as={FiUsers} size={48} color="gray.400" mb={4} />
						<Text fontSize="lg" fontWeight="semibold" color={secondaryTextColor} mb={2}>
							No friends yet
						</Text>
						<Text fontSize="sm" color="gray.400" textAlign="center">
							When {profileUser?.name} makes friends, they'll appear here.
						</Text>
					</Flex>
				) : (
					<VStack spacing={0} divider={<Divider />}>
						{friends.map((friend, index) => (
							<Box key={friend._id} w="full">
								<FriendCard friend={friend} />
							</Box>
						))}
					</VStack>
				)}
			</Box>
		</Box>
	);
};

export default FriendsPage;