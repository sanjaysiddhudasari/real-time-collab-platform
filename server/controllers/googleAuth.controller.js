const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const axios = require("axios");
const dotenv=require('dotenv')
dotenv.config()

const generateTokenAndSetCookies = require("../utils/generateToken");

const googleAuth = (req, res) => {
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "profile email",
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("http://localhost:5173/login?error=google_auth_failed");
    }

    // 1. Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }
    );

    const { access_token } = tokenResponse.data;

    // 2. Fetch user profile from Google
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { id, email, name } = profileResponse.data;

    if (!email) {
      return res.redirect("http://localhost:5173/login?error=no_email");
    }

    // 3. Find existing user by email, or create a new one
    let user = await User.findOne({ email });

    if (!user) {
      const username = name
        ? name.replace(/\s+/g, "_").toLowerCase()
        : email.split("@")[0];

      // Make sure username is unique
      let finalUsername = username;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${username}_${counter}`;
        counter++;
      }

      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);

      user = new User({
        username: finalUsername,
        email,
        password: randomPassword,
        isActive: false,
      });

      await user.save();
    }

    // 4. Generate JWT and set cookie
    generateTokenAndSetCookies(user._id, res);

    // 5. Redirect back to frontend
    res.redirect(
      `http://localhost:5173/?googleLogin=true&userId=${user._id}&username=${user.username}`
    );
  } catch (error) {
    console.error("Google auth error:", error);
    res.redirect("http://localhost:5173/login?error=google_server_error");
  }
};

module.exports = { googleAuth, googleCallback };