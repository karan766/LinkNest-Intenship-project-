import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Avatar, 
  Flex,
  Spinner,
  Icon,
  Divider,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from "@chakra-ui/react";
import { FiUsers, FiUserMinus, FiUserX } from "react-icons/fi";
import { useRef } from "react";

const FollowerPage = () => {
  const user = useRecoilValue(userAtom);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingFriend, setRemovingFriend] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [friendToRemove, setFriendToRemove] = useState(null);
  const cancelRef = useRef();

  // Color mode values
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");

  // Default avatar - using a simple, consistent approach
  // Chakra UI Avatar component will automatically show user initials if no src is provided
  const getAvatarSrc = (friend) => {
    return friend.profilePic || undefined; // Let Chakra UI handle the fallback
  };

  const getFriends = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/friends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      
      const arr = await res.json();
      setFriends([...arr]);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (friend) => {
    setFriendToRemove(friend);
    onOpen();
  };

  const confirmRemove = async () => {
    if (!friendToRemove) return;
    
    try {
      setRemovingFriend(friendToRemove.username);
      await fetch(`/api/users/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: friendToRemove.username, user }),
      });
      getFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setRemovingFriend(null);
      setFriendToRemove(null);
      onClose();
    }
  };

  useEffect(() => {
    getFriends();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh" className="animate-fade-in">
        <VStack spacing={4}>
          <Spinner size="xl" className="spinner" />
          <Text fontSize="lg" color="gray.500">Loading your friends...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={6} className="animate-fade-in">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="center" align="center" className="animate-slide-up">
          <HStack spacing={3}>
            <Icon as={FiUsers} size={28} color="brand.500" />
            <Text fontSize="3xl" fontWeight="bold" color="brand.500">
              Your Friends
            </Text>
          </HStack>
        </Flex>

        <Divider />
        
        {/* Friends List */}
        {friends.length === 0 ? (
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
            <VStack spacing={4}>
              <Icon as={FiUserX} size={48} color="gray.400" />
              <Text fontSize="xl" fontWeight="semibold" color={secondaryTextColor}>
                No friends yet
              </Text>
              <Text color="gray.400">
                Start connecting with people to build your network!
              </Text>
            </VStack>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" color={secondaryTextColor} textAlign="center">
              You have {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </Text>
            
            {friends.map((friend, index) => (
              <Box
                key={friend._id || index}
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="2xl"
                p={6}
                border="1px solid"
                borderColor={borderColor}
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
                className="hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                _hover={{
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                  transform: "translateY(-2px)",
                }}
              >
                <Flex justify="space-between" align="center" p={2}>
                  <HStack spacing={4} flex={1}>
                    {/* Avatar with consistent fallback */}
                    <Avatar
                      size="lg"
                      src={getAvatarSrc(friend)}
                      name={friend.name || friend.username}
                      className="hover-glow"
                    />

                    {/* User Info */}
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="lg" fontWeight="bold" color={textColor}>
                        {friend.username}
                      </Text>
                      <Text fontSize="md" color={secondaryTextColor}>
                        {friend.name}
                      </Text>
                      {friend.bio && (
                        <Text fontSize="sm" color="gray.400" noOfLines={1}>
                          {friend.bio}
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {/* Remove Button */}
                  <Button
                    leftIcon={<FiUserMinus />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveClick(friend)}
                    isLoading={removingFriend === friend.username}
                    loadingText="Removing..."
                    className="hover-lift"
                    _hover={{
                      bg: "red.50",
                      borderColor: "red.300"
                    }}
                  >
                    Remove
                  </Button>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent className="card">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove Friend
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to remove <strong>{friendToRemove?.username}</strong> from your friends list?
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmRemove} 
                ml={3}
                leftIcon={<FiUserMinus />}
              >
                Remove Friend
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default FollowerPage;

