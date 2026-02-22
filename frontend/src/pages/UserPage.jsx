import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Box, Text, VStack } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";

const UserPage = () => {
	const { user, loading } = useGetUserProfile();
	const { username } = useParams();
	const showToast = useShowToast();
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [fetchingPosts, setFetchingPosts] = useState(true);

	useEffect(() => {
		const getPosts = async () => {
			if (!user) return;
			setFetchingPosts(true);
			try {
				// Decode the username in case it's URL encoded
				const decodedUsername = decodeURIComponent(username);
				const res = await fetch(`/api/posts/user/${encodeURIComponent(decodedUsername)}`);
				const data = await res.json();
				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setPosts([]);
			} finally {
				setFetchingPosts(false);
			}
		};

		getPosts();
	}, [username, user]); // Only depend on username and user, not showToast or setPosts

	if (!user && loading) {
		return (
			<Flex justifyContent={"center"} py={8}>
				<Spinner size={"xl"} />
			</Flex>
		);
	}

	if (!user && !loading) {
		return (
			<Box textAlign="center" py={8}>
				<Text fontSize={{ base: "lg", md: "xl" }} color="gray.500">
					User not found
				</Text>
			</Box>
		);
	}

	return (
		<Box w="full" maxW="100%" overflowX="hidden">
			<UserHeader user={user} />

			{!fetchingPosts && posts.length === 0 && (
				<Box textAlign="center" py={8} mt={6}>
					<Text fontSize={{ base: "md", md: "lg" }} color="gray.500">
						User has no posts yet.
					</Text>
				</Box>
			)}
			
			{fetchingPosts && (
				<Flex justifyContent={"center"} my={{ base: 8, md: 12 }}>
					<Spinner size={"xl"} />
				</Flex>
			)}

			<VStack spacing={{ base: 4, md: 6 }} mt={{ base: 4, md: 6 }} w="full">
				{posts.map((post) => (
					<Post key={post._id} post={post} postedBy={post.postedBy} />
				))}
			</VStack>
		</Box>
	);
};

export default UserPage;
