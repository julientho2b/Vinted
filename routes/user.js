const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (req.body.newsletter === undefined) {
      return res.status(400).json({ message: "Please do a choice" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).json({ message: "An account already exist" });
    }

    const password = req.body.password;
    const salt = uid2(24);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(20);

    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save();

    return res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email or password incorrect" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "Email or password incorrect" });
    }

    if (
      SHA256(req.body.password + user.salt).toString(encBase64) === user.hash
    ) {
      return res.status(200).json({
        _id: user._id,
        token: user.token,
        account: {
          username: user.account.username,
        },
      });
    } else {
      return res.status(400).json({ message: "Email or password incorrect" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
