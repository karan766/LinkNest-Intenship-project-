import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

export default function SignupCard() {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom);

  // Color mode values
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "gray.800");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "gray.600");

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      localStorage.setItem("user-threads", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = inputs.name && inputs.username && inputs.email && inputs.password;

  return (
    <VStack spacing={8} align="center">
      <VStack align="center" spacing={4}>
        <Text fontSize="4xl" fontWeight="bold" color="brand.500">
          LinkNest
        </Text>
        <Heading fontSize="2xl" textAlign="center" color="brand.400">
          Join LinkNest
        </Heading>
        <Text fontSize="md" color={secondaryTextColor} textAlign="center">
          Create your account and start connecting
        </Text>
      </VStack>
      
      <Stack spacing={6} w="full">
        <HStack spacing={4}>
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="semibold" color={secondaryTextColor}>
              Full Name
            </FormLabel>
            <Input
              type="text"
              placeholder="John Doe"
              onChange={(e) =>
                setInputs({ ...inputs, name: e.target.value })
              }
              value={inputs.name}
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              color={textColor}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="semibold" color={secondaryTextColor}>
              Username
            </FormLabel>
            <Input
              type="text"
              placeholder="johndoe"
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
              value={inputs.username}
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              color={textColor}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
            />
          </FormControl>
        </HStack>
        
        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="semibold" color={secondaryTextColor}>
            Email Address
          </FormLabel>
          <Input
            type="email"
            placeholder="john@example.com"
            onChange={(e) =>
              setInputs({ ...inputs, email: e.target.value })
            }
            value={inputs.email}
            bg={inputBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            color={textColor}
            _focus={{
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
          />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="semibold" color={secondaryTextColor}>
            Password
          </FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
              value={inputs.password}
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              color={textColor}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
            />
            <InputRightElement h="full">
              <Button
                variant="ghost"
                onClick={() =>
                  setShowPassword((showPassword) => !showPassword)
                }
                _hover={{ bg: "transparent" }}
                color={secondaryTextColor}
              >
                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
          <Text fontSize="xs" color={secondaryTextColor} mt={2}>
            Password must contain at least 8 characters with uppercase, lowercase, and numbers
          </Text>
        </FormControl>
        
        <Stack spacing={6} pt={2}>
          <Button
            size="lg"
            onClick={handleSignup}
            isLoading={loading}
            loadingText="Creating account..."
            disabled={!isFormValid}
            leftIcon={<FiUserPlus />}
            bg="brand.500"
            color="white"
            _hover={{ bg: "brand.600" }}
            _disabled={{ 
              bg: "gray.300", 
              color: "gray.500",
              cursor: "not-allowed"
            }}
            borderRadius="xl"
            h={12}
          >
            Create Account
          </Button>
          
          <Text align="center" fontSize="sm" color={secondaryTextColor}>
            Already have an account?{" "}
            <Link 
              color="brand.500"
              fontWeight="semibold"
              _hover={{ textDecoration: "underline", color: "brand.600" }}
              onClick={() => setAuthScreen("login")}
              cursor="pointer"
            >
              Sign in here
            </Link>
          </Text>
        </Stack>
      </Stack>
    </VStack>
  );
}
