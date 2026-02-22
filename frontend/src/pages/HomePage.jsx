import { Box, Flex, Spinner, VStack, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import Search from "../components/Search";
import { FiHome, FiUsers } from "react-icons/fi";

const HomePage = () => {
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [loading, setLoading] = useState(true);
	const showToast = useShowToast();
	
	// Color mode values
	const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
	const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");
	const textColor = useColorModeValue("gray.800", "gray.100");
	const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
	
	useEffect(() => {
		const getFeedPosts = async () => {
			setLoading(true);
			setPosts([]);
			try {
				const res = await fetch("/api/posts/feed");
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};
		getFeedPosts();
	}, []); // Empty dependency array - only run once on mount

	return (
		<Box className="animate-fade-in" minH="100vh">
			<Flex gap={8} alignItems="flex-start">
				{/* Main Feed */}
				<Box flex={70}>
					{/* Feed Header */}
					<Box 
						bg={cardBg}
						backdropFilter="blur(20px)"
						borderRadius="2xl"
						p={6}
						border="1px solid"
						borderColor={borderColor}
						boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
						mb={6}
					>
						<Flex align="center" gap={3}>
							<Icon as={FiHome} size={24} color="brand.500" />
							<Text fontSize="2xl" fontWeight="bold" color="brand.500">
								Your Feed
							</Text>
						</Flex>
					</Box>

					{/* Loading State */}
					{loading && (
						<Flex justify="center" py={16} className="animate-fade-in">
							<VStack spacing={4}>
								<Spinner size="xl" color="brand.500" />
								<Text color={secondaryTextColor}>Loading your feed...</Text>
							</VStack>
						</Flex>
					)}

					{/* Empty State */}
					{!loading && posts.length === 0 && (
						<Box 
							bg={cardBg}
							backdropFilter="blur(20px)"
							borderRadius="2xl"
							p={16}
							border="1px solid"
							borderColor={borderColor}
							boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
							textAlign="center"
							className="animate-scale-in"
						>
							<VStack spacing={6}>
								<Icon as={FiUsers} size={64} color="gray.400" />
								<VStack spacing={2}>
									<Text fontSize="xl" fontWeight="semibold" color={secondaryTextColor}>
										Your feed is empty
									</Text>
									<Text color="gray.400" maxW="md">
										Start following users or create your first post to see content in your feed
									</Text>
								</VStack>
							</VStack>
						</Box>
					)}

					{/* Posts */}
					{!loading && posts.length > 0 && (
						<VStack spacing={6} align="stretch">
							{posts.map((post, index) => (
								<Box
									key={post._id}
									className="animate-slide-up hover-lift"
									style={{ animationDelay: `${index * 0.1}s` }}
								>
									<Post post={post} postedBy={post.postedBy} />
								</Box>
							))}
						</VStack>
					)}
				</Box>

				{/* Sidebar */}
				<Box
					flex={30}
					display={{ base: "none", md: "block" }}
					position="sticky"
					top="120px"
				>
					<VStack spacing={6} align="stretch">
						{/* Search Component */}
						<Box className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
							<Search />
						</Box>

						{/* Quick Stats Card */}
						<Box 
							bg={cardBg}
							backdropFilter="blur(20px)"
							borderRadius="2xl"
							p={6}
							border="1px solid"
							borderColor={borderColor}
							boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
							className="animate-slide-up" 
							style={{ animationDelay: "0.3s" }}
						>
							<VStack spacing={4} align="stretch">
								<Text fontSize="lg" fontWeight="semibold" color="brand.500">
									Quick Stats
								</Text>
								<VStack spacing={2} align="stretch">
									<Flex justify="space-between">
										<Text color={secondaryTextColor}>Posts in feed</Text>
										<Text fontWeight="semibold" color={textColor}>{posts.length}</Text>
									</Flex>
									<Flex justify="space-between">
										<Text color={secondaryTextColor}>Status</Text>
										<Text fontWeight="semibold" color="green.500">Active</Text>
									</Flex>
								</VStack>
							</VStack>
						</Box>

						{/* Tips Card */}
						<Box 
							bg={cardBg}
							backdropFilter="blur(20px)"
							borderRadius="2xl"
							p={6}
							border="1px solid"
							borderColor={borderColor}
							boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
							className="animate-slide-up" 
							style={{ animationDelay: "0.4s" }}
						>
							<VStack spacing={3} align="stretch">
								<Text fontSize="lg" fontWeight="semibold" color="brand.500">
									💡 Tips
								</Text>
								<VStack spacing={2} align="start" fontSize="sm" color={secondaryTextColor}>
									<Text>• Follow more users to see more content</Text>
									<Text>• Like and comment to engage with the community</Text>
									<Text>• Share your thoughts by creating posts</Text>
								</VStack>
							</VStack>
						</Box>
					</VStack>
				</Box>
			</Flex>
		</Box>
	);
};

export default HomePage;