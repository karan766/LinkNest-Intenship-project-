import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner } from "@chakra-ui/react";
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
			<Flex justifyContent={"center"}>
				<Spinner size={"xl"} />
			</Flex>
		);
	}

	if (!user && !loading) return <h1>User not found</h1>;

	return (
		<>
			<UserHeader user={user} />

			{!fetchingPosts && posts.length === 0 && <h1>User has not posts.</h1>}
			{fetchingPosts && (
				<Flex justifyContent={"center"} my={12}>
					<Spinner size={"xl"} />
				</Flex>
			)}

			{posts.map((post) => (
				<Post key={post._id} post={post} postedBy={post.postedBy} />
			))}
		</>
	);
};

export default UserPage;
