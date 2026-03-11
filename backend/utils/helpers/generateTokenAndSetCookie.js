import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "12h", // 12 hours
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    sameSite: "strict",
  });

  return token;
};

export default generateTokenAndSetCookie;
