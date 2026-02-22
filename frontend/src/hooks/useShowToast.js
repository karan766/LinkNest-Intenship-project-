import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { useColorModeValue } from "@chakra-ui/react";

const useShowToast = () => {
	const toast = useToast();
	
	// Define theme-aware styles outside the callback
	const toastStyles = {
		background: useColorModeValue(
			"linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))",
			"linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.9))"
		),
		border: useColorModeValue(
			"1px solid rgba(103, 126, 234, 0.2)",
			"1px solid rgba(255, 255, 255, 0.1)"
		),
		borderRadius: "16px",
		backdropFilter: "blur(20px)",
		boxShadow: useColorModeValue(
			"0 8px 32px rgba(103, 126, 234, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)",
			"0 8px 32px rgba(0, 0, 0, 0.3)"
		),
		color: useColorModeValue("#2D3748", "#F7FAFC"),
	};

	const showToast = useCallback(
		(title, description, status) => {
			toast({
				title,
				description,
				status,
				duration: 3000,
				isClosable: true,
				position: "top-right",
				variant: "left-accent",
				containerStyle: toastStyles,
			});
		},
		[toast, toastStyles]
	);

	return showToast;
};

export default useShowToast;
