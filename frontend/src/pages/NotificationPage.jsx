import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link } from "react-router-dom";
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Avatar, 
  Badge, 
  Flex,
  Spinner,
  Icon,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { 
  FiUsers, 
  FiCheck, 
  FiMessageCircle, 
  FiHeart, 
  FiMessageSquare,
  FiBell,
  FiCheckCircle,
  FiX
} from "react-icons/fi";

const NotificationPage = () => {
  const user = useRecoilValue(userAtom);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Color mode values
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const hoverBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.1)");

  const getNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/notifications`);
      const result = await res.json();
      
      if (res.ok && Array.isArray(result)) {
        setNotifications(result);
      } else {
        console.error("Error from API:", result.error || "Unknown error");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/users/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/users/notifications/mark-all-read`, {
        method: "PUT",
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const acceptedOrReject = async (username, action) => {
    try {
      const res = await fetch(`/api/users/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, action, user }),
      });

      const result = await res.json();
      if (result.success) {
        getNotifications();
      } else {
        console.error("Error processing friend request:", result.error);
        
        if (result.cleanup) {
          getNotifications();
        }
      }
    } catch (error) {
      console.error("Error processing friend request:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20 };
    switch (type) {
      case "friend_request":
        return <Icon as={FiUsers} {...iconProps} color="blue.500" />;
      case "friend_accept":
        return <Icon as={FiCheckCircle} {...iconProps} color="green.500" />;
      case "message":
        return <Icon as={FiMessageCircle} {...iconProps} color="purple.500" />;
      case "like":
        return <Icon as={FiHeart} {...iconProps} color="red.500" />;
      case "comment":
        return <Icon as={FiMessageSquare} {...iconProps} color="orange.500" />;
      default:
        return <Icon as={FiBell} {...iconProps} color="gray.500" />;
    }
  };

  const getNotificationAction = (notification) => {
    if (notification.type === "friend_request") {
      return (
        <HStack spacing={2}>
          <Button
            size="sm"
            className="btn-success"
            leftIcon={<FiCheck />}
            onClick={() => acceptedOrReject(notification.sender.username, 1)}
          >
            Accept
          </Button>
          <Button
            size="sm"
            className="btn-danger"
            leftIcon={<FiX />}
            onClick={() => acceptedOrReject(notification.sender.username, 0)}
          >
            Decline
          </Button>
        </HStack>
      );
    } else if (notification.type === "message") {
      return (
        <Button
          as={Link}
          to="/chat"
          size="sm"
          className="btn-primary"
          leftIcon={<FiMessageCircle />}
        >
          View
        </Button>
      );
    } else if (notification.type === "like" || notification.type === "comment") {
      return (
        <Button
          as={Link}
          to={`/${notification.sender.username}`}
          size="sm"
          className="btn-secondary"
        >
          View Post
        </Button>
      );
    }
    return null;
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    if (user?._id) {
      getNotifications();
    }
  }, [user]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh" className="animate-fade-in">
        <VStack spacing={4}>
          <Spinner size="xl" className="spinner" />
          <Text fontSize="lg" color="gray.500">Loading notifications...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={6} className="animate-fade-in">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" className="animate-slide-up">
          <HStack spacing={3}>
            <Icon as={FiBell} size={28} color="brand.500" />
            <Text fontSize="3xl" fontWeight="bold" color="brand.500">
              Notifications
            </Text>
          </HStack>
          {notifications.some(n => !n.read) && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              leftIcon={<FiCheckCircle />}
              color={textColor}
              _hover={{ bg: hoverBg }}
            >
              Mark all as read
            </Button>
          )}
        </Flex>

        <Divider />
        
        {/* Notifications List */}
        {notifications.length === 0 ? (
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
              <Icon as={FiBell} size={48} color="gray.400" />
              <Text fontSize="xl" fontWeight="semibold" color={secondaryTextColor}>
                No notifications yet
              </Text>
              <Text color="gray.400">
                You'll see notifications here when people interact with your posts
              </Text>
            </VStack>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {notifications.map((notification, index) => (
              <Box
                key={notification._id}
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="2xl"
                p={6}
                border="1px solid"
                borderColor={!notification.read ? "brand.500" : borderColor}
                borderLeftWidth={!notification.read ? "4px" : "1px"}
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
                className="hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                cursor={!notification.read ? "pointer" : "default"}
                onClick={() => !notification.read && markAsRead(notification._id)}
                _hover={{
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                  transform: "translateY(-2px)",
                }}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={4} flex={1}>
                    {/* Icon */}
                    <Box className="icon-container">
                      {getNotificationIcon(notification.type)}
                    </Box>

                    {/* Avatar */}
                    <Avatar
                      size="md"
                      src={notification.sender?.profilePic}
                      name={notification.sender?.username}
                      className="hover-lift"
                    />

                    {/* Content */}
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="semibold" fontSize="md" color={textColor}>
                        {notification.message}
                      </Text>
                      
                      {/* Additional content based on type */}
                      {notification.type === "message" && notification.data?.messageText && (
                        <Text fontSize="sm" color={secondaryTextColor} fontStyle="italic">
                          "{notification.data.messageText}"
                        </Text>
                      )}
                      
                      {notification.type === "like" && notification.data?.postText && (
                        <Text fontSize="sm" color={secondaryTextColor}>
                          Post: "{notification.data.postText.substring(0, 50)}..."
                        </Text>
                      )}
                      
                      {notification.type === "comment" && notification.data?.postText && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color={secondaryTextColor}>
                            Post: "{notification.data.postText.substring(0, 50)}..."
                          </Text>
                          {notification.data?.commentText && (
                            <Text fontSize="xs" color="gray.400">
                              Comment: "{notification.data.commentText.substring(0, 40)}..."
                            </Text>
                          )}
                        </VStack>
                      )}
                      
                      <Text fontSize="xs" color="gray.400">
                        {formatTime(notification.createdAt)}
                      </Text>
                    </VStack>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <Badge className="notification-badge">
                        New
                      </Badge>
                    )}
                  </HStack>

                  {/* Action buttons */}
                  <Box>
                    {getNotificationAction(notification)}
                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default NotificationPage;
