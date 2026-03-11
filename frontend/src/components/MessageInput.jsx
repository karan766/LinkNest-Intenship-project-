import {
	Flex,
	Image,
	Input,
	InputGroup,
	InputRightElement,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Spinner,
	useDisclosure,
	Tooltip,
	Icon,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import { MdLock, MdLockOpen } from "react-icons/md";
import useShowToast from "../hooks/useShowToast";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import usePreviewImg from "../hooks/usePreviewImg";
import userAtom from "../atoms/userAtom";
import { encryptMessage, getPrivateKey } from "../utils/encryption";

const MessageInput = ({ setMessages }) => {
	const [messageText, setMessageText] = useState("");
	const showToast = useShowToast();
	const selectedConversation = useRecoilValue(selectedConversationAtom);
	const setConversations = useSetRecoilState(conversationsAtom);
	const currentUser = useRecoilValue(userAtom);
	const imageRef = useRef(null);
	const { onClose } = useDisclosure();
	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
	const [isSending, setIsSending] = useState(false);
	const [isEncrypted, setIsEncrypted] = useState(false);

	// Check encryption status when conversation changes
	useEffect(() => {
		const checkEncryption = async () => {
			if (!selectedConversation || !currentUser) {
				setIsEncrypted(false);
				return;
			}

			try {
				const recipientRes = await fetch(`/api/users/publickey/${selectedConversation.userId}`);
				const recipientData = await recipientRes.json();
				const privateKey = getPrivateKey(currentUser._id);
				
				setIsEncrypted(!!(recipientData.publicKey && privateKey));
			} catch (error) {
				setIsEncrypted(false);
			}
		};

		checkEncryption();
	}, [selectedConversation, currentUser]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!messageText && !imgUrl) return;
		if (isSending) return;

		setIsSending(true);

		try {
			let encryptedText = messageText;
			
			// Try to encrypt the message if both users have encryption set up
			if (messageText) {
				try {
					// Get recipient's public key
					const recipientRes = await fetch(`/api/users/publickey/${selectedConversation.userId}`);
					const recipientData = await recipientRes.json();
					
					// Get sender's private key
					const privateKey = getPrivateKey(currentUser._id);
					
					// Only encrypt if both keys exist
					if (recipientData.publicKey && privateKey) {
						encryptedText = await encryptMessage(messageText, recipientData.publicKey);
					}
				} catch (encError) {
					console.log("Encryption not available, sending unencrypted:", encError.message);
					// Continue with unencrypted message
				}
			}

			const res = await fetch("/api/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: encryptedText,
					recipientId: selectedConversation.userId,
					img: imgUrl,
				}),
			});
			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			
			// Store the original unencrypted text for display
			const displayMessage = { ...data, text: messageText };
			setMessages((messages) => [...messages, displayMessage]);

			setConversations((prevConvs) => {
				const updatedConversations = prevConvs.map((conversation) => {
					if (conversation._id === selectedConversation._id) {
						return {
							...conversation,
							lastMessage: {
								text: messageText,
								sender: data.sender,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
			setMessageText("");
			setImgUrl("");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsSending(false);
		}
	};
	return (
		<Flex gap={2} alignItems={"center"}>
			<Tooltip label={isEncrypted ? "End-to-end encrypted" : "Not encrypted"} placement="top">
				<Flex alignItems="center" mr={1}>
					<Icon 
						as={isEncrypted ? MdLock : MdLockOpen} 
						w={4} 
						h={4} 
						color={isEncrypted ? "green.500" : "gray.400"} 
					/>
				</Flex>
			</Tooltip>
			<form onSubmit={handleSendMessage} style={{ flex: 95 }}>
				<InputGroup>
					<Input
						w={"full"}
						placeholder='Type a message'
						onChange={(e) => setMessageText(e.target.value)}
						value={messageText}
					/>
					<InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
						<IoSendSharp />
					</InputRightElement>
				</InputGroup>
			</form>
			<Flex flex={5} cursor={"pointer"}>
				<BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
				<Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
			</Flex>
			<Modal
				isOpen={imgUrl}
				onClose={() => {
					onClose();
					setImgUrl("");
				}}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex mt={5} w={"full"}>
							<Image src={imgUrl} />
						</Flex>
						<Flex justifyContent={"flex-end"} my={2}>
							{!isSending ? (
								<IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
							) : (
								<Spinner size={"md"} />
							)}
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default MessageInput;
