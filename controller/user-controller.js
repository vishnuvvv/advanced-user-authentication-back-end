import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = "myKey";

export const signUp = async (req, res, next) => {
  //sigup route which will store users info
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }

  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists..! Login instead." });
  }
  const hashedPassword = bcrypt.hashSync(password);
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await user.save();
  } catch {
    console.log(err);
  }

  return res.status(201).json({ message: user });
};

export const signIn = async (req, res, next) => {
  // we can authenticate using previous details here we have registered jwt and stored in httpOnlyCookie
  let existingUser;
  let { email, password } = req.body;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }

  if (!existingUser) {
    return res
      .status(400)
      .json({ message: "User not found ..! Signup please" });
  }
  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid Email / Password" });
  }

  const token = jwt.sign({ id: existingUser._id }, JWT_SECRET_KEY, {
    // registerd a jwt token for 30 seconds
    expiresIn: "35s",
  });

  console.log("Generated Token\n", token);

  if (req.cookies[`${existingUser._id}`]) {
    req.cookies[`${existingUser._id}`] = "";
  }

  res.cookie(String(existingUser._id), token, {
    // after the defined the cookies and passed userid, and details of cookies  the token in cookies
    path: "/",
    expires: new Date(Date.now() + 1000 * 30), // registerd cokkie for 30 seconds
    httpOnly: true, // http only cookies makes more secure which is not accessible in front end
    sameSite: "lax",
  });

  return res
    .status(200)
    .json({ message: `Successfuly logged in`, user: existingUser, token }); //after signin returned   existinguse data and token through cookies
};

export const verifyToken = (req, res, next) => {
  //Before getting user detailes verified the token and which will give authorisation to access data through server
  // after that verify token if the token is valid then only we will be able to access the data
  const cookies = req.headers.cookie;
  const token = cookies.split("=")[1];
  console.log(token);

  //const headers = req.headers[`authorization`];
  //const token = headers.split(" ")[1];
  if (!token) {
    res.status(404).json({ message: "No token found" });
  }
  jwt.verify(String(token), JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    console.log(user.id);
    req.id = user.id;
  });
  next();
};

export const getUser = async (req, res, next) => {
  // here we are getting the token again
  // get user function called after verification to get data from server
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    return new Error();
  }
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  return res.status(200).json({ user });
};

