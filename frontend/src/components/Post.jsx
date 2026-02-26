import { Avatar, Image, Box, Flex, Text, VStack, HStack, IconButton, Tooltip, useColorModeValue, Icon } from "@chakra-ui/react";
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
import { MdVerified } from "react-icons/md";

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
        // Handle both object and string postedBy
        let userIdentifier;
        if (typeof postedBy === 'object' && postedBy !== null) {
          // If postedBy is already a populated user object, use it directly
          setUser(postedBy);
          return;
        } else if (typeof postedBy === 'string') {
          // If postedBy is a string (user ID), fetch the user
          userIdentifier = postedBy;
        } else {
          console.error('Invalid postedBy format:', postedBy);
          return;
        }

        const res = await fetch("/api/users/profile/" + userIdentifier);
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
        borderRadius={{ base: "xl", md: "2xl" }}
        p={{ base: 4, md: 6 }}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        transition="all 0.3s ease"
        _hover={{
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-2px)",
        }}
      >
        <Flex gap={{ base: 3, md: 4 }} direction={{ base: "column", sm: "row" }}>
          {/* Left Column - Avatar and Thread Line */}
          <VStack spacing={2} align="center" minW={{ base: "auto", sm: "60px" }}>
            <Avatar
              size={{ base: "sm", md: "md" }}
              name={user.name}
              src={user?.profilePic}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${user.username}`);
              }}
              cursor="pointer"
              className="hover-glow"
            />
            
            {/* Thread Line - Hidden on mobile when stacked */}
            <Box 
              w="2px" 
              h="full" 
              bg={threadLineColor} 
              opacity={0.4}
              display={{ base: "none", sm: "block" }}
            />
            
            {/* Reply Avatars */}
            <Box 
              position="relative" 
              w="full"
              display={{ base: "none", sm: "block" }}
            >
              {post.replies.length === 0 && (
                <Text textAlign="center" fontSize={{ base: "md", md: "lg" }}>
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
          <VStack flex={1} align="stretch" spacing={{ base: 2, md: 3 }}>
            {/* Header */}
            <Flex justify="space-between" align="center" flexWrap="nowrap" gap={{ base: 1, md: 2 }}>
              <HStack spacing={1} flex={1} minW={0} overflow="hidden">
                <Text
                  fontWeight="bold"
                  fontSize={{ base: "sm", md: "md" }}
                  color={textColor}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${user.username}`);
                  }}
                  cursor="pointer"
                  _hover={{ color: "brand.500" }}
                  transition="colors 0.2s"
                  isTruncated
                  noOfLines={1}
                  maxW="100%"
                >
                  {user?.username}
                </Text>
                <Icon as={MdVerified} w={4} h={4} color="blue.500" flexShrink={0} />
              </HStack>
              
              <HStack spacing={{ base: 1, md: 2 }} flexShrink={0} minW="fit-content">
                <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.500" whiteSpace="nowrap">
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </Text>
                
                {currentUser?._id === user._id && (
                  <Tooltip label="Delete post">
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<FiTrash2 size={14} />}
                      onClick={handleDeleteClick}
                      colorScheme="red"
                      className="hover-lift"
                      minW="auto"
                      h={{ base: 6, md: 8 }}
                      w={{ base: 6, md: 8 }}
                    />
                  </Tooltip>
                )}
              </HStack>
            </Flex>

            {/* Post Content */}
            <Text 
              fontSize={{ base: "sm", md: "md" }} 
              lineHeight="1.6" 
              color={textColor}
              wordBreak="break-word"
            >
              {post.text}
            </Text>

            {/* Post Image */}
            {post.img && (
              <Box
                borderRadius={{ base: "lg", md: "xl" }}
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
                className="hover-glow"
                w="full"
              >
                <Image 
                  src={post.img} 
                  w="full" 
                  objectFit="contain"
                  loading="lazy"
                  maxH={{ base: "500px", md: "600px" }}
                />
              </Box>
            )}

            {/* Actions */}
            <Box pt={{ base: 1, md: 2 }}>
              <Actions post={post} />
            </Box>

            {/* Reply Count and Mobile Reply Avatars */}
            <Flex 
              justify="space-between" 
              align="center"
              flexWrap="wrap"
              gap={2}
            >
              {post.replies.length > 0 && (
                <HStack spacing={2} color="gray.500" fontSize={{ base: "xs", md: "sm" }}>
                  <FiMessageCircle size={16} />
                  <Text>
                    {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                  </Text>
                </HStack>
              )}
              
              {/* Mobile Reply Avatars */}
              <HStack 
                spacing={-2} 
                display={{ base: "flex", sm: "none" }}
                flexShrink={0}
              >
                {post.replies.slice(0, 3).map((reply, index) => (
                  <Avatar
                    key={index}
                    size="xs"
                    src={reply.userProfilePic}
                    border="2px solid white"
                    className="hover-lift"
                    zIndex={3 - index}
                  />
                ))}
                {post.replies.length === 0 && (
                  <Text fontSize="sm">🤔</Text>
                )}
              </HStack>
            </Flex>
          </VStack>
        </Flex>
      </Box>
    </Link>
  );
};

export default Post;
