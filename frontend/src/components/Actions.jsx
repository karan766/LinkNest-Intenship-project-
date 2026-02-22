import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
  HStack,
  Avatar,
  Divider,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { FiHeart, FiUsers, FiX } from "react-icons/fi";

const Actions = ({ post }) => {
  const user = useRecoilValue(userAtom);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [likesData, setLikesData] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isLikesOpen, 
    onOpen: onLikesOpen, 
    onClose: onLikesClose 
  } = useDisclosure();

  const handleLikeAndUnlike = async () => {
    if (!user)
      return showToast(
        "Error",
        "You must be logged in to like a post",
        "error"
      );
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch("/api/posts/like/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      if (!liked) {
        // add the id of the current user to post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: [...p.likes, user._id] };
          }
          return p;
        });
        setPosts(updatedPosts);
      } else {
        // remove the id of the current user from post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: p.likes.filter((id) => id !== user._id) };
          }
          return p;
        });
        setPosts(updatedPosts);
      }

      setLiked(!liked);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsLiking(false);
    }
  };

  const getLikedPeople = async () => {
    setLoadingLikes(true);
    try {
      const res = await fetch(`/api/users/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postid: post._id }),
      });

      const arr = await res.json();
      setLikesData([...arr]);
    } catch (error) {
      showToast("Error", "Failed to load likes", "error");
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleReply = async () => {
    if (!user)
      return showToast(
        "Error",
        "You must be logged in to reply to a post",
        "error"
      );
    if (isReplying) return;
    setIsReplying(true);
    try {
      const res = await fetch("/api/posts/reply/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: reply }),
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) {
          return { ...p, replies: [...p.replies, data] };
        }
        return p;
      });
      setPosts(updatedPosts);
      showToast("Success", "Reply posted successfully", "success");
      onClose();
      setReply("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsReplying(false);
    }
  };

  const handleShowLikes = () => {
    getLikedPeople();
    onLikesOpen();
  };

  return (
    <Flex flexDirection="column">
      <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
        <svg
          aria-label="Like"
          color={liked ? "rgb(237, 73, 86)" : ""}
          fill={liked ? "rgb(237, 73, 86)" : "transparent"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          onClick={handleLikeAndUnlike}
          style={{ cursor: "pointer" }}
        >
          <path
            d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
        </svg>

        <svg
          aria-label="Comment"
          color=""
          fill=""
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={onOpen}
          style={{ cursor: "pointer" }}
        >
          <title>Comment</title>
          <path
            d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
        </svg>

        <RepostSVG />
        <ShareSVG />
        
        {post.likes.length > 0 && (
          <Icon 
            as={FiUsers} 
            w={5} 
            h={5} 
            cursor="pointer" 
            onClick={handleShowLikes}
            color="gray.500"
            _hover={{ color: "blue.500" }}
            transition="color 0.2s"
          />
        )}
      </Flex>

      <Flex gap={2} alignItems={"center"}>
        <Text color={"gray.light"} fontSize="sm">
          {post.replies.length} replies
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text color={"gray.light"} fontSize="sm">
          {post.likes.length} likes
        </Text>
      </Flex>

      {/* Reply Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent className="card">
          <ModalHeader>Reply to Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                className="input-modern focus-ring"
                placeholder="Write your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              className="btn-primary"
              size="sm"
              mr={3}
              isLoading={isReplying}
              onClick={handleReply}
              disabled={!reply.trim()}
            >
              Reply
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Likes Modal */}
      <Modal isOpen={isLikesOpen} onClose={onLikesClose} size="md">
        <ModalOverlay />
        <ModalContent className="card animate-scale-in">
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiHeart} color="red.500" />
              <Text>Liked by</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            {loadingLikes ? (
              <Flex justify="center" py={8}>
                <VStack spacing={3}>
                  <Spinner size="lg" />
                  <Text color="gray.500">Loading likes...</Text>
                </VStack>
              </Flex>
            ) : (
              <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
                {likesData.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <VStack spacing={3}>
                      <Icon as={FiHeart} boxSize={8} color="gray.400" />
                      <Text color="gray.500">No likes yet</Text>
                      <Text fontSize="sm" color="gray.400">
                        Be the first to like this post!
                      </Text>
                    </VStack>
                  </Box>
                ) : (
                  likesData.map((person, index) => (
                    <Box key={index}>
                      <HStack spacing={4} p={3} className="hover-lift" borderRadius="lg">
                        <Avatar
                          size="md"
                          src={person.profilePic}
                          name={person.name || person.username}
                        />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="semibold" fontSize="md">
                            {person.username}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {person.name}
                          </Text>
                        </VStack>
                        <Icon as={FiHeart} color="red.500" boxSize={4} />
                      </HStack>
                      {index < likesData.length - 1 && <Divider />}
                    </Box>
                  ))
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onLikesClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Actions;

const RepostSVG = () => {
  return (
    <svg
      aria-label="Repost"
      color="currentColor"
      fill="currentColor"
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
    >
      <title>Repost</title>
      <path
        fill=""
        d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
      ></path>
    </svg>
  );
};

const ShareSVG = () => {
  return (
    <svg
      aria-label="Share"
      color=""
      fill="rgb(243, 245, 247)"
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
      style={{ cursor: "pointer" }}
    >
      <title>Share</title>
      <line
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
        x1="22"
        x2="9.218"
        y1="3"
        y2="10.083"
      ></line>
      <polygon
        fill="none"
        points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      ></polygon>
    </svg>
  );
};
