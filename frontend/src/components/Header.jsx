import { Button, Flex, Link, useColorMode, Badge, Box, Avatar, Tooltip, useColorModeValue, Text } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import WhiteBell from "../assets/icons/WhiteBell.jsx";
import BlackBell from "../assets/icons/BlackBell.jsx";
import { FaUserFriends } from "react-icons/fa";
import { useState, useEffect } from "react";

const Header = () => {
  const { colorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Color mode values
  const headerBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");
  const iconBg = useColorModeValue("rgba(255, 255, 255, 0.6)", "rgba(0, 0, 0, 0.2)");
  const iconHoverBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.1)");

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?._id) {
        try {
          const res = await fetch("/api/users/notifications/unread-count");
          const data = await res.json();
          if (res.ok) {
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      }
    };

    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Flex 
      justifyContent="space-between" 
      alignItems="center"
      mt={{ base: 2, md: 4 }}
      mb={{ base: 4, md: 6 }}
      mx={{ base: -2, sm: 0 }}
      px={{ base: 3, sm: 4, md: 6 }}
      py={{ base: 2, md: 3 }}
      bg={headerBg}
      backdropFilter="blur(20px)"
      borderRadius={{ base: "xl", md: "2xl" }}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
      position="sticky"
      top={{ base: 2, md: 4 }}
      zIndex={100}
      className="animate-fade-in"
      w="full"
      maxW="100%"
      overflowX="hidden"
    >
      {user && (
        <Link as={RouterLink} to="/" style={{ textDecoration: 'none' }}>
          <Box 
            fontWeight="bold" 
            fontSize={{ base: "2xl", sm: "3xl" }}
            bgGradient="linear(135deg, brand.500, brand.700)"
            bgClip="text"
            _hover={{
              bgGradient: "linear(135deg, brand.600, brand.800)",
              transform: "scale(1.02)",
            }}
            transition="all 0.2s"
          >
            LinkNest
          </Box>
        </Link>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to="/auth"
          onClick={() => setAuthScreen("login")}
          className="btn-ghost text-lg font-semibold hover-lift"
        >
          Login
        </Link>
      )}

      {user && (
        <Flex alignItems="center" gap={{ base: 1, sm: 2, md: 3 }} flexWrap="nowrap" flexShrink={0}>
          <Tooltip label="Profile" placement="bottom">
            <Link as={RouterLink} to={`/${user.username}`}>
              <Box 
                bg={iconBg}
                backdropFilter="blur(10px)"
                borderRadius="full"
                p={{ base: 1, sm: 1.5, md: 2 }}
                w={{ base: 7, sm: 8, md: 10 }}
                h={{ base: 7, sm: 8, md: 10 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s"
                _hover={{
                  bg: iconHoverBg,
                  transform: "scale(1.05)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                }}
              >
                {user.profilePic ? (
                  <Avatar size="2xs" src={user.profilePic} name={user.name} w="20px" h="20px" />
                ) : (
                  <RxAvatar size={20} />
                )}
              </Box>
            </Link>
          </Tooltip>

          <Tooltip label="Notifications" placement="bottom">
            <Box position="relative">
              <Link as={RouterLink} to="/notifications">
                <Box 
                  bg={iconBg}
                  backdropFilter="blur(10px)"
                  borderRadius="full"
                  p={{ base: 1, sm: 1.5, md: 2 }}
                  w={{ base: 7, sm: 8, md: 10 }}
                  h={{ base: 7, sm: 8, md: 10 }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.3s"
                  _hover={{
                    bg: iconHoverBg,
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <Box w="20px" h="20px" display="flex" alignItems="center" justifyContent="center">
                    {colorMode === "dark" ? <WhiteBell /> : <BlackBell />}
                  </Box>
                </Box>
              </Link>
              {unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top={{ base: "-4px", md: "-6px" }}
                  right={{ base: "-4px", md: "-6px" }}
                  bg="red.500"
                  color="white"
                  fontSize="2xs"
                  borderRadius="full"
                  w={{ base: 4, md: 5 }}
                  h={{ base: 4, md: 5 }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  boxShadow="0 2px 8px rgba(239, 68, 68, 0.3)"
                  className="animate-bounce-in"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Box>
          </Tooltip>

          <Tooltip label="Messages" placement="bottom">
            <Link as={RouterLink} to="/chat">
              <Box 
                bg={iconBg}
                backdropFilter="blur(10px)"
                borderRadius="full"
                p={{ base: 1, sm: 1.5, md: 2 }}
                w={{ base: 7, sm: 8, md: 10 }}
                h={{ base: 7, sm: 8, md: 10 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s"
                _hover={{
                  bg: iconHoverBg,
                  transform: "scale(1.05)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                }}
              >
                <BsFillChatQuoteFill size={20} />
              </Box>
            </Link>
          </Tooltip>

          <Tooltip label="Settings" placement="bottom" display={{ base: "none", md: "block" }}>
            <Link as={RouterLink} to="/settings">
              <Box 
                bg={iconBg}
                backdropFilter="blur(10px)"
                borderRadius="full"
                p={{ base: 1, sm: 1.5, md: 2 }}
                w={{ base: 7, sm: 8, md: 10 }}
                h={{ base: 7, sm: 8, md: 10 }}
                display={{ base: "none", md: "flex" }}
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s"
                _hover={{
                  bg: iconHoverBg,
                  transform: "scale(1.05)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                }}
              >
                <MdOutlineSettings size={20} />
              </Box>
            </Link>
          </Tooltip>

          <Tooltip label="Logout" placement="bottom">
            <Button
              size={{ base: "xs", sm: "sm" }}
              onClick={logout}
              bg="red.500"
              color="white"
              _hover={{ 
                bg: "red.600",
                transform: "scale(1.05)",
              }}
              leftIcon={<FiLogOut size={12} />}
              borderRadius={{ base: "lg", md: "xl" }}
              boxShadow="0 4px 15px rgba(239, 68, 68, 0.3)"
              transition="all 0.3s"
              fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
              px={{ base: 2, sm: 3, md: 4 }}
              py={{ base: 1, sm: 2 }}
              h={{ base: 7, sm: 8, md: 10 }}
              minW={{ base: "auto", sm: "auto" }}
            >
              <Text display={{ base: "none", sm: "block" }}>Logout</Text>
            </Button>
          </Tooltip>
        </Flex>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to="/auth"
          onClick={() => setAuthScreen("signup")}
          bg="brand.500"
          color="white"
          px={6}
          py={3}
          borderRadius="xl"
          fontWeight="semibold"
          _hover={{
            bg: "brand.600",
            transform: "scale(1.05)",
          }}
          boxShadow="0 8px 25px rgba(102, 126, 234, 0.3)"
          transition="all 0.3s"
        >
          Sign up
        </Link>
      )}
    </Flex>
  );
};

export default Header;
