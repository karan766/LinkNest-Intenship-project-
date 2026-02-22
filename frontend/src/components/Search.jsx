/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const Search = () => {
  const user = useRecoilValue(userAtom);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Color mode values
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");
  const inputBg = useColorModeValue("rgba(255, 255, 255, 0.6)", "rgba(45, 55, 72, 0.8)");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const hoverBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.1)");

  const handleSearchChange = (value) => {
    setSearchText(value);
    
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    if (value.length >= 1) {
      window.searchTimeout = setTimeout(() => {
        searchUsers(value);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const searchUsers = async (username) => {
    try {
      const res = await fetch("/api/users/Search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, user }),
      });

      const results = await res.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleUserAction = async (requestedUserId, userIndex) => {
    try {
      const res = await fetch("/api/users/search-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestedUserId, user }),
      });

      const result = await res.json();
      
      if (result.success) {
        const updatedResults = [...searchResults];
        updatedResults[userIndex].status = result.status;
        setSearchResults(updatedResults);
      }
    } catch (error) {
      console.error("Action error:", error);
    }
  };

  const showUserProfile = (userData) => {
    setSelectedUser(userData);
    onOpen();
  };

  const getButtonProps = (status) => {
    switch (status) {
      case "Friend":
        return {
          colorScheme: "green",
          children: "Friend",
          isDisabled: true,
        };
      case "Request":
        return {
          colorScheme: "blue",
          children: "Add Friend",
          isDisabled: false,
        };
      case "Requested":
        return {
          colorScheme: "gray",
          children: "Cancel Request",
          isDisabled: false,
        };
      default:
        return {
          colorScheme: "blue",
          children: status,
          isDisabled: false,
        };
    }
  };

  return (
    <>
      <Box
        bg={cardBg}
        backdropFilter="blur(20px)"
        borderRadius={{ base: "xl", md: "2xl" }}
        p={{ base: 4, sm: 5, md: 6 }}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        w="full"
        maxW="100%"
      >
        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="brand.500">
            🔍 Search Users
          </Text>
          
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={secondaryTextColor} />
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
              color={textColor}
              fontSize={{ base: "sm", md: "md" }}
              h={{ base: 10, md: 12 }}
            />
          </InputGroup>

          {searchText.length === 0 && (
            <Text fontSize="sm" color={secondaryTextColor} textAlign="center" py={4}>
              Start typing to search users...
            </Text>
          )}

          {searchText.length > 0 && searchResults.length === 0 && (
            <Text fontSize="sm" color={secondaryTextColor} textAlign="center" py={4}>
              No users found for "{searchText}"
            </Text>
          )}

          {searchResults.length > 0 && (
            <VStack 
              spacing={2} 
              align="stretch" 
              maxH="300px"
              overflowY="auto"
              className="search-results"
            >
              {searchResults.map((userData, index) => (
                userData.username === user.username ? (
                  <Box key={index} p={{ base: 2, md: 3 }} textAlign="center">
                    <Text fontSize="sm" color={secondaryTextColor}>
                      That's you! 👋
                    </Text>
                  </Box>
                ) : (
                  <Box
                    key={index}
                    p={{ base: 2, md: 3 }}
                    borderRadius={{ base: "lg", md: "xl" }}
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" spacing={{ base: 2, md: 3 }}>
                      <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
                        <Avatar
                          size={{ base: "sm", md: "md" }}
                          src={userData.profilePic}
                          name={userData.name}
                          cursor="pointer"
                          onClick={() => showUserProfile(userData)}
                        />
                        <VStack align="start" spacing={0} flex={1} minW={0}>
                          <Text
                            fontWeight="bold"
                            color={textColor}
                            cursor="pointer"
                            onClick={() => showUserProfile(userData)}
                            _hover={{ color: "brand.500" }}
                            fontSize={{ base: "sm", md: "md" }}
                            isTruncated
                          >
                            {userData.username}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor} isTruncated>
                            {userData.name}
                          </Text>
                        </VStack>
                      </HStack>

                      <Button
                        size={{ base: "xs", md: "sm" }}
                        {...getButtonProps(userData.status)}
                        onClick={() => handleUserAction(userData.id, index)}
                        fontSize={{ base: "xs", md: "sm" }}
                        px={{ base: 2, md: 3 }}
                        flexShrink={0}
                      />
                    </HStack>
                  </Box>
                )
              ))}
              
              {searchResults.length > 5 && (
                <Box p={2} textAlign="center">
                  <Text fontSize="xs" color={secondaryTextColor}>
                    +{searchResults.length - 5} more results
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </Box>

      {/* User Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "md" }}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={cardBg}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.2)"
          mx={{ base: 2, sm: 4 }}
          my={{ base: 4, sm: 8 }}
          borderRadius={{ base: "xl", sm: "2xl" }}
        >
          <ModalHeader color={textColor} fontSize={{ base: "lg", md: "xl" }}>
            User Profile
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} px={{ base: 4, md: 6 }}>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={{ base: 3, sm: 0 }}>
                  <VStack align="start" spacing={1} flex={1} minW={0}>
                    <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textColor} isTruncated>
                      {selectedUser.username}
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} color={secondaryTextColor} isTruncated>
                      {selectedUser.name}
                    </Text>
                  </VStack>
                  <Avatar
                    size={{ base: "md", md: "lg" }}
                    src={selectedUser.profilePic}
                    name={selectedUser.name}
                    flexShrink={0}
                  />
                </HStack>

                <Divider />

                <HStack>
                  <Badge colorScheme="blue" variant="subtle" fontSize={{ base: "xs", md: "sm" }}>
                    {selectedUser.followers} followers
                  </Badge>
                </HStack>

                <Box>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColor}>
                    {selectedUser.bio || "No bio available"}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Search;
