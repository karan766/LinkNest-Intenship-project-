import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text, VStack, HStack } from "@chakra-ui/layout";
import { IconButton } from "@chakra-ui/button";
import { Tooltip } from "@chakra-ui/tooltip";
import { useColorModeValue } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import { FiTrash2, FiMessageCircle } from "react-icons/fi";

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();
  
  // Color mode values for better light/dark mode support
  const confirmBg = useColorModeValue("red.500", "red.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const threadLineColor = useColorModeValue("gray.300", "gray.600");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
  const textColor = useColorModeValue("gray.800", "gray.100");

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/users/profile/" + postedBy);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
      }
    };

    getUser();
  }, [postedBy]); // Only depend on postedBy, not showToast

  const handleDeletePost = async (e) => {
    try {
      e.preventDefault();
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted successfully", "success");
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const confirmDeletePost = (e) => {
    e.preventDefault();
    showToast("Confirm", "Click delete again to confirm", "warning");
    // Set a temporary state to track confirmation
    const deleteButton = e.currentTarget;
    deleteButton.setAttribute('data-confirmed', 'true');
    deleteButton.style.backgroundColor = '#e53e3e';
    setTimeout(() => {
      deleteButton.removeAttribute('data-confirmed');
      deleteButton.style.backgroundColor = '';
    }, 3000);
  };

  const handleDeleteClick = (e) => {
    if (e.currentTarget.getAttribute('data-confirmed') === 'true') {
      handleDeletePost(e);
    } else {
      confirmDeletePost(e);
    }
  };

  if (!user) return null;

  return (
    <Link to={`/${encodeURIComponent(user.username)}/post/${post._id}`} style={{ textDecoration: 'none' }}>
      <Box 
        className="hover-lift"
        bg={cardBg}
        backdropFilter="blur(20px)"
        borderRadius="2xl"
        p={6}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        transition="all 0.3s ease"
        _hover={{
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-2px)",
        }}
      >
        <Flex gap={4}>
          {/* Left Column - Avatar and Thread Line */}
          <VStack spacing={2} align="center">
            <Avatar
              size="md"
              name={user.name}
              src={user?.profilePic}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${user.username}`);
              }}
              cursor="pointer"
              className="hover-glow"
            />
            
            {/* Thread Line */}
            <Box w="2px" h="full" bg={threadLineColor} opacity={0.4} />
            
            {/* Reply Avatars */}
            <Box position="relative" w="full">
              {post.replies.length === 0 && (
                <Text textAlign="center" fontSize="lg">
                  🤔
                </Text>
              )}
              
              {post.replies.slice(0, 3).map((reply, index) => (
                <Avatar
                  key={index}
                  size="xs"
                  src={reply.userProfilePic}
                  position="absolute"
                  top={index * 8}
                  left={index * 6}
                  border="2px solid white"
                  className="hover-lift"
                />
              ))}
            </Box>
          </VStack>

          {/* Right Column - Content */}
          <VStack flex={1} align="stretch" spacing={3}>
            {/* Header */}
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color={textColor}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${user.username}`);
                  }}
                  cursor="pointer"
                  _hover={{ color: "brand.500" }}
                  transition="colors 0.2s"
                >
                  {user?.username}
                </Text>
                <Image src="/verified.png" w={4} h={4} />
              </HStack>
              
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </Text>
                
                {currentUser?._id === user._id && (
                  <Tooltip label="Delete post">
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={<FiTrash2 />}
                      onClick={handleDeleteClick}
                      colorScheme="red"
                      className="hover-lift"
                    />
                  </Tooltip>
                )}
              </HStack>
            </Flex>

            {/* Post Content */}
            <Text fontSize="sm" lineHeight="1.6" color={textColor}>
              {post.text}
            </Text>

            {/* Post Image */}
            {post.img && (
              <Box
                borderRadius="xl"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
                className="hover-glow"
              >
                <Image src={post.img} w="full" objectFit="cover" />
              </Box>
            )}

            {/* Actions */}
            <Box pt={2}>
              <Actions post={post} />
            </Box>

            {/* Reply Count */}
            {post.replies.length > 0 && (
              <HStack spacing={2} color="gray.500" fontSize="sm">
                <FiMessageCircle size={16} />
                <Text>
                  {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                </Text>
              </HStack>
            )}
          </VStack>
        </Flex>
      </Box>
    </Link>
  );
};

export default Post;
