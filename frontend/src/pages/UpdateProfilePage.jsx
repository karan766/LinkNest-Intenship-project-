import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Stack,
	useColorModeValue,
	Avatar,
	Center,
	VStack,
	HStack,
	Text,
	Textarea,
	Box,
	Icon,
	Divider,
	Alert,
	AlertIcon,
	AlertDescription,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";
import { FiUser, FiMail, FiLock, FiCamera, FiSave, FiX } from "react-icons/fi";

export default function UpdateProfilePage() {
	const [user, setUser] = useRecoilState(userAtom);
	const navigate = useNavigate();
	const [inputs, setInputs] = useState({
		name: user.name || "",
		username: user.username || "",
		email: user.email || "",
		bio: user.bio || "",
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	
	const fileRef = useRef(null);
	const [updating, setUpdating] = useState(false);
	const [errors, setErrors] = useState({});
	
	const showToast = useShowToast();
	const { handleImageChange, imgUrl } = usePreviewImg();

	// Form validation
	const validateForm = () => {
		const newErrors = {};
		
		if (!inputs.name.trim()) {
			newErrors.name = "Name is required";
		}
		
		if (!inputs.username.trim()) {
			newErrors.username = "Username is required";
		} else if (inputs.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		}
		
		if (!inputs.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
			newErrors.email = "Email is invalid";
		}
		
		// Password validation - only validate if user is actually trying to change password
		// We determine this by checking if they've entered a new password OR confirm password
		const isAttemptingPasswordChange = inputs.newPassword.trim() || inputs.confirmPassword.trim();
		
		if (isAttemptingPasswordChange) {
			// If they want to change password, they need the old password
			if (!inputs.oldPassword.trim()) {
				newErrors.oldPassword = "Current password is required to change password";
			}
			
			// They need to provide a new password
			if (!inputs.newPassword.trim()) {
				newErrors.newPassword = "New password is required";
			} else {
				// Validate new password strength
				if (inputs.newPassword.length < 8) {
					newErrors.newPassword = "New password must be at least 8 characters";
				} else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(inputs.newPassword)) {
					newErrors.newPassword = "Password must contain uppercase, lowercase, and numbers";
				}
			}
			
			// Check password confirmation
			if (!inputs.confirmPassword.trim()) {
				newErrors.confirmPassword = "Please confirm your new password";
			} else if (inputs.newPassword !== inputs.confirmPassword) {
				newErrors.confirmPassword = "Passwords do not match";
			}
		}
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) {
			showToast("Error", "Please fix the form errors", "error");
			return;
		}
		
		if (updating) return;
		setUpdating(true);
		
		try {
			// Prepare data to send - only include password fields if user is actually changing password
			const isChangingPassword = inputs.newPassword.trim() || inputs.confirmPassword.trim();
			const updateData = {
				name: inputs.name,
				username: inputs.username,
				email: inputs.email,
				bio: inputs.bio,
				profilePic: imgUrl
			};
			
			// Only add password fields if user is changing password
			if (isChangingPassword) {
				updateData.oldPassword = inputs.oldPassword;
				updateData.newPassword = inputs.newPassword;
				updateData.confirmPassword = inputs.confirmPassword;
			}
			
			const res = await fetch(`/api/users/update/${user._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});
			
			const data = await res.json();
			
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			
			showToast("Success", "Profile updated successfully", "success");
			setUser(data);
			localStorage.setItem("user-threads", JSON.stringify(data));
			
			// Clear password fields after successful update
			setInputs(prev => ({
				...prev,
				oldPassword: "",
				newPassword: "",
				confirmPassword: ""
			}));
			
			// Navigate back to profile after a short delay
			setTimeout(() => {
				navigate(`/${data.username}`);
			}, 1500);
			
		} catch (error) {
			showToast("Error", error.message || "Something went wrong", "error");
		} finally {
			setUpdating(false);
		}
	};

	const handleCancel = () => {
		navigate(`/${user.username}`);
	};

	const handleInputChange = (field, value) => {
		setInputs(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	return (
		<Box className="animate-fade-in" minH="100vh" py={8}>
			<Flex align="center" justify="center">
				<Box className="card-elevated" w="full" maxW="2xl" p={8}>
					<form onSubmit={handleSubmit}>
						<VStack spacing={8} align="stretch">
							{/* Header */}
							<VStack spacing={2}>
								<Icon as={FiUser} size={32} color="#667eea" />
								<Heading fontSize="2xl" textAlign="center" color="#667eea">
									Edit Profile
								</Heading>
								<Text color="gray.500" textAlign="center">
									Update your profile information and settings
								</Text>
							</VStack>

							<Divider />

							{/* Avatar Section */}
							<FormControl>
								<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
									Profile Picture
								</FormLabel>
								<VStack spacing={4}>
									<Avatar
										size="2xl"
										src={imgUrl || user.profilePic}
										name={user.name}
										className="hover-glow"
									/>
									<Button
										leftIcon={<FiCamera />}
										variant="outline"
										onClick={() => fileRef.current?.click()}
										className="hover-lift"
									>
										Change Avatar
									</Button>
									<Input
										type="file"
										hidden
										ref={fileRef}
										onChange={handleImageChange}
										accept="image/*"
									/>
								</VStack>
							</FormControl>

							<Divider />

							{/* Basic Information */}
							<VStack spacing={6} align="stretch">
								<Text fontSize="lg" fontWeight="semibold" color="gray.700">
									Basic Information
								</Text>

								<HStack spacing={4}>
									<FormControl isInvalid={errors.name}>
										<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
											Full Name
										</FormLabel>
										<Input
											className="input-modern focus-ring"
											placeholder="Enter your full name"
											value={inputs.name}
											onChange={(e) => handleInputChange("name", e.target.value)}
										/>
										{errors.name && (
											<Text fontSize="sm" color="red.500" mt={1}>
												{errors.name}
											</Text>
										)}
									</FormControl>

									<FormControl isInvalid={errors.username}>
										<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
											Username
										</FormLabel>
										<Input
											className="input-modern focus-ring"
											placeholder="Enter username"
											value={inputs.username}
											onChange={(e) => handleInputChange("username", e.target.value)}
										/>
										{errors.username && (
											<Text fontSize="sm" color="red.500" mt={1}>
												{errors.username}
											</Text>
										)}
									</FormControl>
								</HStack>

								<FormControl isInvalid={errors.email}>
									<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
										Email Address
									</FormLabel>
									<Input
										className="input-modern focus-ring"
										type="email"
										placeholder="Enter your email"
										value={inputs.email}
										onChange={(e) => handleInputChange("email", e.target.value)}
									/>
									{errors.email && (
										<Text fontSize="sm" color="red.500" mt={1}>
											{errors.email}
										</Text>
									)}
								</FormControl>

								<FormControl>
									<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
										Bio
									</FormLabel>
									<Textarea
										className="input-modern focus-ring"
										placeholder="Tell us about yourself..."
										value={inputs.bio}
										onChange={(e) => handleInputChange("bio", e.target.value)}
										rows={3}
										resize="vertical"
									/>
									<Text fontSize="xs" color="gray.500" mt={1}>
										{inputs.bio.length}/160 characters
									</Text>
								</FormControl>
							</VStack>

							<Divider />

							{/* Password Section */}
							<VStack spacing={6} align="stretch">
								<HStack spacing={2}>
									<Icon as={FiLock} color="gray.500" />
									<Text fontSize="lg" fontWeight="semibold" color="gray.700">
										Change Password
									</Text>
									<Text fontSize="sm" color="gray.500">(Optional)</Text>
								</HStack>

								<Alert status="info" borderRadius="lg">
									<AlertIcon />
									<AlertDescription fontSize="sm">
										Leave password fields empty if you don't want to change your password.
									</AlertDescription>
								</Alert>

								<FormControl isInvalid={errors.oldPassword}>
									<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
										Current Password
									</FormLabel>
									<Input
										className="input-modern focus-ring"
										type="password"
										placeholder="Enter current password"
										value={inputs.oldPassword}
										onChange={(e) => handleInputChange("oldPassword", e.target.value)}
									/>
									{errors.oldPassword && (
										<Text fontSize="sm" color="red.500" mt={1}>
											{errors.oldPassword}
										</Text>
									)}
								</FormControl>

								<HStack spacing={4}>
									<FormControl isInvalid={errors.newPassword}>
										<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
											New Password
										</FormLabel>
										<Input
											className="input-modern focus-ring"
											type="password"
											placeholder="Enter new password"
											value={inputs.newPassword}
											onChange={(e) => handleInputChange("newPassword", e.target.value)}
										/>
										{errors.newPassword && (
											<Text fontSize="sm" color="red.500" mt={1}>
												{errors.newPassword}
											</Text>
										)}
									</FormControl>

									<FormControl isInvalid={errors.confirmPassword}>
										<FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
											Confirm Password
										</FormLabel>
										<Input
											className="input-modern focus-ring"
											type="password"
											placeholder="Confirm new password"
											value={inputs.confirmPassword}
											onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
										/>
										{errors.confirmPassword && (
											<Text fontSize="sm" color="red.500" mt={1}>
												{errors.confirmPassword}
											</Text>
										)}
									</FormControl>
								</HStack>
							</VStack>

							<Divider />

							{/* Action Buttons */}
							<HStack spacing={4} justify="center">
								<Button
									leftIcon={<FiX />}
									variant="outline"
									onClick={handleCancel}
									disabled={updating}
									className="hover-lift"
								>
									Cancel
								</Button>
								<Button
									leftIcon={<FiSave />}
									type="submit"
									isLoading={updating}
									loadingText="Updating..."
									className="btn-primary"
									disabled={updating}
								>
									Save Changes
								</Button>
							</HStack>
						</VStack>
					</form>
				</Box>
			</Flex>
		</Box>
	);
}