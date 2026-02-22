import {
	Flex,
	Box,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	Button,
	Heading,
	Text,
	useColorModeValue,
	Link,
	Icon,
	VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { FiUser, FiLock } from "react-icons/fi";

export default function LoginCard() {
	const [showPassword, setShowPassword] = useState(false);
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const setUser = useSetRecoilState(userAtom);
	const [loading, setLoading] = useState(false);

	const [inputs, setInputs] = useState({
		username: "",
		password: "",
	});
	const showToast = useShowToast();
	
	// Color mode values
	const textColor = useColorModeValue("gray.800", "gray.100");
	const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
	const inputBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "gray.800");
	const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "gray.600");
	
	const handleLogin = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/users/login", {
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

	return (
		<VStack spacing={{ base: 6, md: 8 }} align="center">
			<VStack align="center" spacing={4}>
				<Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="brand.500">
					LinkNest
				</Text>
				<Heading fontSize={{ base: "xl", md: "2xl" }} textAlign="center" color="brand.400">
					Welcome Back
				</Heading>
				<Text fontSize={{ base: "sm", md: "md" }} color={secondaryTextColor} textAlign="center">
					Sign in to your account to continue
				</Text>
			</VStack>
			
			<Stack spacing={6} w="full">
				<FormControl isRequired>
					<FormLabel fontSize="sm" fontWeight="semibold" color={secondaryTextColor}>
						Username
					</FormLabel>
					<InputGroup>
						<Input
							type="text"
							placeholder="Enter your username"
							value={inputs.username}
							onChange={(e) => setInputs((inputs) => ({ ...inputs, username: e.target.value }))}
							bg={inputBg}
							border="1px solid"
							borderColor={borderColor}
							borderRadius="xl"
							color={textColor}
							size={{ base: "md", md: "lg" }}
							_focus={{
								borderColor: "brand.500",
								boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
							}}
						/>
					</InputGroup>
				</FormControl>
				
				<FormControl isRequired>
					<FormLabel fontSize="sm" fontWeight="semibold" color={secondaryTextColor}>
						Password
					</FormLabel>
					<InputGroup>
						<Input
							type={showPassword ? "text" : "password"}
							placeholder="Enter your password"
							value={inputs.password}
							onChange={(e) => setInputs((inputs) => ({ ...inputs, password: e.target.value }))}
							bg={inputBg}
							border="1px solid"
							borderColor={borderColor}
							borderRadius="xl"
							color={textColor}
							size={{ base: "md", md: "lg" }}
							_focus={{
								borderColor: "brand.500",
								boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
							}}
						/>
						<InputRightElement h="full">
							<Button
								variant="ghost"
								onClick={() => setShowPassword((showPassword) => !showPassword)}
								_hover={{ bg: "transparent" }}
								color={secondaryTextColor}
							>
								{showPassword ? <ViewIcon /> : <ViewOffIcon />}
							</Button>
						</InputRightElement>
					</InputGroup>
				</FormControl>
				
				<Stack spacing={6} pt={2}>
					<Button
						size={{ base: "md", md: "lg" }}
						onClick={handleLogin}
						isLoading={loading}
						loadingText="Signing in..."
						disabled={!inputs.username || !inputs.password}
						bg="brand.500"
						color="white"
						_hover={{ bg: "brand.600" }}
						_disabled={{ 
							bg: "gray.300", 
							color: "gray.500",
							cursor: "not-allowed"
						}}
						borderRadius="xl"
						h={{ base: 12, md: 14 }}
						fontSize={{ base: "md", md: "lg" }}
					>
						Sign In
					</Button>
					
					<Text align="center" fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>
						Don't have an account?{" "}
						<Link 
							color="brand.500"
							fontWeight="semibold" 
							_hover={{ textDecoration: "underline", color: "brand.600" }}
							onClick={() => setAuthScreen("signup")}
							cursor="pointer"
						>
							Create one now
						</Link>
					</Text>
				</Stack>
			</Stack>
		</VStack>
	);
}
