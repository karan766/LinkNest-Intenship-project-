import { Avatar, Box, Flex, Link, Text, VStack, Menu, MenuButton, MenuItem, MenuList, Portal, Button, useToast } from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom); // logged in user
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

  const copyURL = () => {
    // Create a proper URL with encoded username
    const baseURL = window.location.origin;
    const encodedUsername = encodeURIComponent(user.username);
    const profileURL = `${baseURL}/${encodedUsername}`;
    
    navigator.clipboard.writeText(profileURL).then(() => {
      toast({
        title: "Success.",
        status: "success",
        description: "Profile link copied.",
        duration: 3000,
        isClosable: true,
      });
    }).catch(() => {
      toast({
        title: "Error",
        status: "error", 
        description: "Failed to copy link.",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  return (
    <VStack gap={{ base: 3, md: 4 }} alignItems={"start"} w="full" maxW="100%" px={{ base: 2, md: 0 }}>
      <Flex justifyContent={"space-between"} w={"full"} align="flex-start">
        <Box flex={1} minW={0} pr={{ base: 3, md: 4 }}>
          <Text fontSize={{ base: "lg", md: "xl", lg: "2xl" }} fontWeight={"bold"} isTruncated>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"} mt={1}>
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" isTruncated>
              @{user.username}
            </Text>
            <Text
              fontSize={"xs"}
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              borderRadius={"full"}
            ></Text>
          </Flex>
        </Box>
        <Box flexShrink={0}>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "lg",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "lg",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" lineHeight="1.5" w="full">
        {user.bio}
      </Text>

      <Flex direction={{ base: "column", sm: "row" }} gap={{ base: 2, sm: 3 }} w="full">
        {currentUser?._id === user._id && (
          <Link as={RouterLink} to="/update">
            <Button size={{ base: "sm", md: "md" }} colorScheme="blue" w={{ base: "full", sm: "auto" }}>
              Update Profile
            </Button>
          </Link>
        )}
        {currentUser?._id !== user._id && (
          <Button 
            size={{ base: "sm", md: "md" }} 
            onClick={handleFollowUnfollow} 
            isLoading={updating}
            colorScheme={following ? "red" : "blue"}
            w={{ base: "full", sm: "auto" }}
          >
            {following ? "Unfollow" : "Follow"}
          </Button>
        )}
      </Flex>
      
      <Flex w={"full"} justifyContent={"space-between"} align="center" flexWrap={{ base: "wrap", md: "nowrap" }} gap={{ base: 2, md: 0 }}>
        <Flex gap={2} alignItems={"center"} flex={1} minW={0}>
          <Text 
            color={"gray.light"} 
            cursor="pointer"
            _hover={{ color: "#667eea", textDecoration: "underline" }}
            as={RouterLink}
            to={`/${user.username}/friends`}
            fontSize={{ base: "sm", md: "md" }}
            isTruncated
          >
            {user.friends?.length || 0} friends
          </Text>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
          <Link color={"gray.light"} fontSize={{ base: "sm", md: "md" }}>LinkNest</Link>
        </Flex>
        <Flex gap={{ base: 2, md: 3 }} flexShrink={0}>
          <Box className="icon-container">
            <BsInstagram size={20} cursor={"pointer"} />
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size={20} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                  <MenuItem bg={"gray.dark"} onClick={copyURL}>
                    Copy link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"} mt={{ base: 2, md: 3 }}>
        <Flex
          flex={1}
          borderBottom={"1.5px solid white"}
          justifyContent={"center"}
          pb={{ base: 2, md: 3 }}
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"} fontSize={{ base: "md", md: "lg" }}>Posts</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
