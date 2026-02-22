import { Avatar, Box, Flex, Image, Skeleton, Text, useColorModeValue } from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

const Message = ({ ownMessage, message }) => {
	const selectedConversation = useRecoilValue(selectedConversationAtom);
	const user = useRecoilValue(userAtom);
	const [imgLoaded, setImgLoaded] = useState(false);
	
	// Color mode values
	const ownMessageBg = useColorModeValue("brand.500", "green.800");
	const otherMessageBg = useColorModeValue("gray.200", "gray.600");
	const otherMessageText = useColorModeValue("gray.800", "white");
	return (
		<>
			{ownMessage ? (
				<Flex gap={2} alignSelf={"flex-end"}>
					{message.text && (
						<Flex bg={ownMessageBg} maxW={"350px"} p={3} borderRadius={"xl"}>
							<Text color={"white"}>{message.text}</Text>
							<Box
								alignSelf={"flex-end"}
								ml={1}
								color={message.seen ? "blue.200" : "whiteAlpha.700"}
								fontWeight={"bold"}
							>
								<BsCheck2All size={16} />
							</Box>
						</Flex>
					)}
					{message.img && !imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image
								src={message.img}
								hidden
								onLoad={() => setImgLoaded(true)}
								alt='Message image'
								borderRadius={4}
							/>
							<Skeleton w={"200px"} h={"200px"} />
						</Flex>
					)}

					{message.img && imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image src={message.img} alt='Message image' borderRadius={8} />
							<Box
								alignSelf={"flex-end"}
								ml={1}
								color={message.seen ? "blue.200" : "whiteAlpha.700"}
								fontWeight={"bold"}
							>
								<BsCheck2All size={16} />
							</Box>
						</Flex>
					)}

					<Avatar src={user.profilePic} w='7' h={7} />
				</Flex>
			) : (
				<Flex gap={2}>
					<Avatar src={selectedConversation.userProfilePic} w='7' h={7} />

					{message.text && (
						<Text maxW={"350px"} bg={otherMessageBg} p={3} borderRadius={"xl"} color={otherMessageText}>
							{message.text}
						</Text>
					)}
					{message.img && !imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image
								src={message.img}
								hidden
								onLoad={() => setImgLoaded(true)}
								alt='Message image'
								borderRadius={8}
							/>
							<Skeleton w={"200px"} h={"200px"} />
						</Flex>
					)}

					{message.img && imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image src={message.img} alt='Message image' borderRadius={8} />
						</Flex>
					)}
				</Flex>
			)}
		</>
	);
};

export default Message;
