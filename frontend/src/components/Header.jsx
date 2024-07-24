import { Button, Flex, Link, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { GrLinkedin } from "react-icons/gr";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import WhiteBell from "../assets/icons/WhiteBell.jsx";
import BlackBell from "../assets/icons/BlackBell.jsx";
import { FaUserFriends } from "react-icons/fa";

const Header = () => {
  const { colorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Flex justifyContent={"space-between"} mt={6} mb="12">
      {user && (
        <Link as={RouterLink} to="/">
         <div className="text-3xl font-bold ">
                 LinkNest
                </div>
        </Link>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}
        >
          Login
        </Link>
      )}

      {user && (
        <Flex alignItems={"center"} gap={4}>
          <Link as={RouterLink} to={`/${user.username}`}>
            <RxAvatar size={25} />
          </Link>
          <Link as={RouterLink} to={`/notifications`}>
            {colorMode === "dark" ? <WhiteBell /> : <BlackBell />}
          </Link>
          <Link as={RouterLink} to={`/followers`}>
            {/* {colorMode === "dark" ? <WhiteFollower /> : <BlackFollowers />} */}
            <FaUserFriends size={24} />
          </Link>
          <Link as={RouterLink} to={`/chat`}>
            <BsFillChatQuoteFill size={20} />
          </Link>
          <Link as={RouterLink} to={`/settings`}>
            <MdOutlineSettings size={23} />
          </Link>
          <Button size={"xs"} onClick={logout}>
            <FiLogOut size={20} />
          </Button>
        </Flex>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("signup")}
        >
          Sign up
        </Link>
      )}
    </Flex>
  );
};

export default Header;
