import { AddIcon } from "@chakra-ui/icons";
import {
	Button,
	CloseButton,
	Flex,
	FormControl,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	Textarea,
	useColorModeValue,
	useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [postText, setPostText] = useState("");
	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
	const imageRef = useRef(null);
	const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
	const user = useRecoilValue(userAtom);
	const showToast = useShowToast();
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useRecoilState(postsAtom);
	const { username } = useParams();

	const handleTextChange = (e) => {
		const inputText = e.target.value;

		if (inputText.length > MAX_CHAR) {
			const truncatedText = inputText.slice(0, MAX_CHAR);
			setPostText(truncatedText);
			setRemainingChar(0);
		} else {
			setPostText(inputText);
			setRemainingChar(MAX_CHAR - inputText.length);
		}
	};

	const handleCreatePost = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/posts/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ postedBy: user._id, text: postText, img: imgUrl }),
			});

			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			showToast("Success", "Post created successfully", "success");
			if (username === user.username) {
				setPosts([data, ...posts]);
			}
			onClose();
			setPostText("");
			setImgUrl("");
		} catch (error) {
			showToast("Error", error, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Button
				position={"fixed"}
				bottom={{ base: 4, md: 10 }}
				right={{ base: 4, md: 5 }}
				bg={useColorModeValue("brand.500", "gray.dark")}
				color={useColorModeValue("white", "gray.300")}
				_hover={{
					bg: useColorModeValue("brand.600", "gray.600"),
					transform: "scale(1.05)",
				}}
				onClick={onOpen}
				size={{ base: "md", sm: "lg" }}
				className="shadow-medium"
				borderRadius="full"
				boxShadow="0 8px 25px rgba(102, 126, 234, 0.3)"
				w={{ base: 12, md: 14 }}
				h={{ base: 12, md: 14 }}
				minW={{ base: 12, md: 14 }}
				zIndex={1000}
			>
				<AddIcon />
			</Button>

			<Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "md", md: "lg" }}>
				<ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />

				<ModalContent 
					bg={useColorModeValue("rgba(255, 255, 255, 0.95)", "gray.800")}
					backdropFilter="blur(20px)"
					border="1px solid"
					borderColor={useColorModeValue("rgba(255, 255, 255, 0.4)", "gray.600")}
					boxShadow="0 20px 60px rgba(0, 0, 0, 0.2)"
					mx={{ base: 2, sm: 4 }}
					my={{ base: 4, sm: 8 }}
					maxH={{ base: "90vh", sm: "80vh" }}
					borderRadius={{ base: "xl", sm: "2xl" }}
				>
					<ModalHeader fontSize={{ base: "lg", md: "xl" }} py={{ base: 3, md: 4 }}>
						Create Post
					</ModalHeader>
					<ModalCloseButton size={{ base: "sm", md: "md" }} />
					<ModalBody pb={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
						<FormControl>
							<Textarea
								placeholder='Post content goes here..'
								onChange={handleTextChange}
								value={postText}
								minH={{ base: "120px", md: "150px" }}
								fontSize={{ base: "sm", md: "md" }}
								resize="vertical"
							/>
							<Text fontSize={{ base: "2xs", md: "xs" }} fontWeight='bold' textAlign={"right"} m={"1"} 
								color={useColorModeValue("gray.600", "gray.400")}>
								{remainingChar}/{MAX_CHAR}
							</Text>

							<Input type='file' hidden ref={imageRef} onChange={handleImageChange} />

							<Flex align="center" mt={2}>
								<BsFillImageFill
									style={{ marginLeft: "5px", cursor: "pointer" }}
									size={18}
									onClick={() => imageRef.current.click()}
								/>
								<Text ml={2} fontSize={{ base: "xs", md: "sm" }} color="gray.500">
									Add image
								</Text>
							</Flex>
						</FormControl>

						{imgUrl && (
							<Flex mt={{ base: 3, md: 5 }} w={"full"} position={"relative"}>
								<Image 
									src={imgUrl} 
									alt='Selected img' 
									borderRadius={{ base: "md", md: "lg" }}
									maxH={{ base: "200px", md: "300px" }}
									w="full"
									objectFit="cover"
								/>
								<CloseButton
									onClick={() => {
										setImgUrl("");
									}}
									bg={"gray.800"}
									position={"absolute"}
									top={2}
									right={2}
									size={{ base: "sm", md: "md" }}
								/>
							</Flex>
						)}
					</ModalBody>

					<ModalFooter py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
						<Button 
							bg="brand.500"
							color="white"
							_hover={{ bg: "brand.600" }}
							mr={3} 
							onClick={handleCreatePost} 
							isLoading={loading}
							size={{ base: "sm", md: "md" }}
							w={{ base: "full", sm: "auto" }}
						>
							Post
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreatePost;
