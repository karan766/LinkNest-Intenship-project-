import {
	Avatar,
	AvatarBadge,
	Box,
	Flex,
	Image,
	Stack,
	Text,
	WrapItem,
	useColorMode,
	useColorModeValue,
	Icon,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import { selectedConversationAtom } from "../atoms/messagesAtom";

const Conversation = ({ conversation, isOnline }) => {
	const user = conversation.participants[0];
	const currentUser = useRecoilValue(userAtom);
	const lastMessage = conversation.lastMessage;
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
	const { colorMode } = useColorMode();
	
	// Color mode values
	const hoverBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.1)");
	const selectedBg = useColorModeValue("rgba(102, 126, 234, 0.1)", "gray.dark");
	const textColor = useColorModeValue("gray.800", "gray.100");
	const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
	
	return (
		<Flex
			gap={4}
			alignItems={"center"}
			p={3}
			borderRadius="xl"
			transition="all 0.2s"
			_hover={{
				cursor: "pointer",
				bg: hoverBg,
			}}
			onClick={() =>
				setSelectedConversation({
					_id: conversation._id,
					userId: user._id,
					userProfilePic: user.profilePic,
					username: user.username,
					mock: conversation.mock,
				})
			}
			bg={selectedConversation?._id === conversation._id ? selectedBg : "transparent"}
		>
			<WrapItem>
				<Avatar
					size={{
						base: "xs",
						sm: "sm",
						md: "md",
					}}
					src={user.profilePic}
				>
					{isOnline ? <AvatarBadge boxSize='1em' bg='green.500' /> : ""}
				</Avatar>
			</WrapItem>

			<Stack direction={"column"} fontSize={"sm"}>
				<Text fontWeight='700' display={"flex"} alignItems={"center"} gap={1} color={textColor}>
					{user.username}
					<Icon as={MdVerified} w={4} h={4} color="blue.500" />
				</Text>
				<Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1} color={secondaryTextColor}>
					{currentUser._id === lastMessage.sender ? (
						<Box color={lastMessage.seen ? "blue.400" : "gray.500"}>
							<BsCheck2All size={16} />
						</Box>
					) : (
						""
					)}
					{lastMessage.text.length > 18
						? lastMessage.text.substring(0, 18) + "..."
						: lastMessage.text || <BsFillImageFill size={16} />}
				</Text>
			</Stack>
		</Flex>
	);
};

export default Conversation;
