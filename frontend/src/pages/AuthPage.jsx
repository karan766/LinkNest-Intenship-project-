import { useRecoilValue } from "recoil";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignupCard";
import authScreenAtom from "../atoms/authAtom";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";

const AuthPage = () => {
	const authScreenState = useRecoilValue(authScreenAtom);
	
	// Color mode values
	const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(0, 0, 0, 0.3)");
	const borderColor = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.1)");

	return (
		<Flex 
			minH="100vh" 
			align="center" 
			justify="center"
			px={{ base: 4, sm: 6, md: 8 }}
			py={{ base: 8, md: 12 }}
		>
			<Box
				w="full"
				maxW={{ base: "400px", md: "500px" }}
				bg={cardBg}
				backdropFilter="blur(20px)"
				borderRadius="2xl"
				p={{ base: 6, md: 8 }}
				border="1px solid"
				borderColor={borderColor}
				boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
				className="animate-fade-in"
			>
				{authScreenState === "login" ? <LoginCard /> : <SignupCard />}
			</Box>
		</Flex>
	);
};

export default AuthPage;
