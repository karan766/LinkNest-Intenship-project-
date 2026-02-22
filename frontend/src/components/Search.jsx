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
        borderRadius="2xl"
        p={6}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold" color="brand.500">
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
            <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto">
              {searchResults.map((userData, index) => (
                userData.username === user.username ? (
                  <Box key={index} p={3} textAlign="center">
                    <Text fontSize="sm" color={secondaryTextColor}>
                      That's you! 👋
                    </Text>
                  </Box>
                ) : (
                  <Box
                    key={index}
                    p={3}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3} flex={1}>
                        <Avatar
                          size="sm"
                          src={userData.profilePic}
                          name={userData.name}
                          cursor="pointer"
                          onClick={() => showUserProfile(userData)}
                        />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text
                            fontWeight="bold"
                            color={textColor}
                            cursor="pointer"
                            onClick={() => showUserProfile(userData)}
                            _hover={{ color: "brand.500" }}
                          >
                            {userData.username}
                          </Text>
                          <Text fontSize="xs" color={secondaryTextColor}>
                            {userData.name}
                          </Text>
                        </VStack>
                      </HStack>

                      <Button
                        size="sm"
                        {...getButtonProps(userData.status)}
                        onClick={() => handleUserAction(userData.id, index)}
                      />
                    </HStack>
                  </Box>
                )
              ))}
            </VStack>
          )}
        </VStack>
      </Box>

      {/* User Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={cardBg}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.2)"
        >
          <ModalHeader color={textColor}>User Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {selectedUser.username}
                    </Text>
                    <Text fontSize="sm" color={secondaryTextColor}>
                      {selectedUser.name}
                    </Text>
                  </VStack>
                  <Avatar
                    size="lg"
                    src={selectedUser.profilePic}
                    name={selectedUser.name}
                  />
                </HStack>

                <Divider />

                <HStack>
                  <Badge colorScheme="blue" variant="subtle">
                    {selectedUser.followers} followers
                  </Badge>
                </HStack>

                <Box>
                  <Text fontSize="sm" color={textColor}>
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
