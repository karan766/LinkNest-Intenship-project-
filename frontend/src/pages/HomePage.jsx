import { Box, Flex, Spinner, VStack, Text, Icon, useColorModeValue, Button } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import Search from "../components/Search";
import { FiHome, FiUsers } from "react-icons/fi";

const HomePage = () => {
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
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
			setCurrentPage(1);
			setHasMore(true);
			try {
				const res = await fetch("/api/posts/feed?page=1&limit=6");
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				// Handle both old format (array) and new format (object with posts)
				const postsData = data.posts || data;
				const pagination = data.pagination;
				
				setPosts(postsData);
				if (pagination) {
					setHasMore(pagination.hasMore);
				}
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};
		getFeedPosts();
	}, []); // Empty dependency array - only run once on mount

	const loadMorePosts = useCallback(async () => {
		if (loadingMore || !hasMore) return;
		
		setLoadingMore(true);
		try {
			const nextPage = currentPage + 1;
			const res = await fetch(`/api/posts/feed?page=${nextPage}&limit=6`);
			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			
			// Handle both old format (array) and new format (object with posts)
			const newPosts = data.posts || data;
			const pagination = data.pagination;
			
			// Filter out duplicate posts to prevent repeating
			setPosts(prevPosts => {
				const existingPostIds = new Set(prevPosts.map(post => post._id));
				const uniqueNewPosts = newPosts.filter(post => !existingPostIds.has(post._id));
				return [...prevPosts, ...uniqueNewPosts];
			});
			
			setCurrentPage(nextPage);
			if (pagination) {
				setHasMore(pagination.hasMore);
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setLoadingMore(false);
		}
	}, [currentPage, hasMore, loadingMore, showToast, setPosts]);

	return (
		<Box className="animate-fade-in" minH="100vh" w="full" maxW="100%" overflowX="hidden">
			{/* Mobile Search - Show at top on mobile only */}
			<Box display={{ base: "block", lg: "none" }} mb={{ base: 4, md: 6 }}>
				<Search />
			</Box>

			<Flex 
				gap={{ base: 3, md: 6, lg: 8 }} 
				alignItems="flex-start"
				direction={{ base: "column", lg: "row" }}
				w="full"
				maxW="100%"
			>
				{/* Main Feed */}
				<Box flex={{ base: "1", lg: "70" }} w="full" maxW="100%" minW={0}>
					{/* Feed Header */}
					<Box 
						bg={cardBg}
						backdropFilter="blur(20px)"
						borderRadius={{ base: "xl", md: "2xl" }}
						p={{ base: 3, sm: 4, md: 6 }}
						border="1px solid"
						borderColor={borderColor}
						boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
						mb={{ base: 4, md: 6 }}
						w="full"
						maxW="100%"
					>
						<Flex align="center" gap={{ base: 2, md: 3 }}>
							<Icon as={FiHome} boxSize={{ base: 4, sm: 5, md: 6 }} color="brand.500" />
							<Text fontSize={{ base: "lg", sm: "xl", md: "2xl" }} fontWeight="bold" color="brand.500">
								Your Feed
							</Text>
						</Flex>
					</Box>

					{/* Loading State */}
					{loading && (
						<Flex justify="center" py={{ base: 8, md: 16 }} className="animate-fade-in">
							<VStack spacing={4}>
								<Spinner size={{ base: "lg", md: "xl" }} color="brand.500" />
								<Text color={secondaryTextColor} fontSize={{ base: "sm", md: "md" }}>
									Loading your feed...
								</Text>
							</VStack>
						</Flex>
					)}

					{/* Empty State */}
					{!loading && posts.length === 0 && (
						<Box 
							bg={cardBg}
							backdropFilter="blur(20px)"
							borderRadius={{ base: "xl", md: "2xl" }}
							p={{ base: 6, sm: 8, md: 16 }}
							border="1px solid"
							borderColor={borderColor}
							boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
							textAlign="center"
							className="animate-scale-in"
							w="full"
							maxW="100%"
						>
							<VStack spacing={{ base: 4, md: 6 }}>
								<Icon as={FiUsers} boxSize={{ base: 10, sm: 12, md: 16 }} color="gray.400" />
								<VStack spacing={2}>
									<Text fontSize={{ base: "md", sm: "lg", md: "xl" }} fontWeight="semibold" color={secondaryTextColor}>
										Your feed is empty
									</Text>
									<Text color="gray.400" maxW="md" fontSize={{ base: "sm", md: "md" }} px={{ base: 2, md: 0 }}>
										Start following users or create your first post to see content in your feed
									</Text>
								</VStack>
							</VStack>
						</Box>
					)}

					{/* Posts */}
					{!loading && posts.length > 0 && (
						<VStack spacing={{ base: 4, md: 6 }} align="stretch" w="full">
							{posts.map((post, index) => (
								<Box
									key={post._id}
									className="animate-slide-up hover-lift"
									style={{ animationDelay: `${index * 0.1}s` }}
									w="full"
									maxW="100%"
								>
									<Post post={post} postedBy={post.postedBy} />
								</Box>
							))}
							
							{/* Load More Button - Show only if we have 6+ posts and there are more */}
							{hasMore && posts.length >= 6 && (
								<Box textAlign="center" py={6}>
									<Button
										onClick={loadMorePosts}
										isLoading={loadingMore}
										loadingText="Loading more posts..."
										colorScheme="brand"
										variant="outline"
										size="lg"
										borderRadius="full"
										px={8}
										_hover={{
											transform: "translateY(-2px)",
											boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
										}}
										transition="all 0.3s ease"
									>
										{loadingMore ? "Loading..." : "Load More Posts"}
									</Button>
								</Box>
							)}
							
							{/* End of Feed Message */}
							{!hasMore && posts.length > 0 && (
								<Box textAlign="center" py={8}>
									<Text color={secondaryTextColor} fontSize="sm">
										🎉 You've reached the end of your feed!
									</Text>
								</Box>
							)}
						</VStack>
					)}
				</Box>

				{/* Desktop Sidebar - Hidden on mobile */}
				<Box
					flex={{ base: "1", lg: "30" }}
					w="full"
					display={{ base: "none", lg: "block" }}
					position="sticky"
					top="120px"
					maxW={{ lg: "300px" }}
				>
					<VStack spacing={6} align="stretch">
						{/* Desktop Search Component */}
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
										<Text color={secondaryTextColor} fontSize="md">Posts in feed</Text>
										<Text fontWeight="semibold" color={textColor} fontSize="md">{posts.length}</Text>
									</Flex>
									<Flex justify="space-between">
										<Text color={secondaryTextColor} fontSize="md">Status</Text>
										<Text fontWeight="semibold" color="green.500" fontSize="md">Active</Text>
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