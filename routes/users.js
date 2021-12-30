const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const EMAIL_SECRET = "asdf1093KMnzxcvnkljvasdu09123nlasdasdf";
const { google } = require("googleapis");

// Setting values for email parameter variables
const CLIENT_ID = "437071356780-ai3jjkfgrs1auhg2u1o81pfn98s3aci4.apps.googleusercontent.com";
const CLEINT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04CwhQWJH65xMCgYIARAAGAQSNwF-L9Ir4MIFU1sI1en4ETyeTho3S6iu2AvaQ-zBl1DGagAh98P9DjWscDf0miE84_dbctvoX1Q";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(url, { email, name }) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "the.ot.classroom@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "OT Classroom <the.ot.classroom@gmail.com>",
      to: String(email),
      subject: "Email Verification",
      html: `<h1>Hey there, ${name}!</h1> Thank you for signing up for OT Classroom! <br> Please click <a href="${url}">here</a> email to confirm your email. <br><br> OT Classroom `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
              })
              .catch((err) => console.log(err));

            // Sending an email to the user with a confirmation link
            const emailToken = jwt.sign(email, EMAIL_SECRET);

            const url = `http://localhost:5000/users/confirmed/${emailToken}`;

            sendMail(url, newUser)
              .then(() => console.log("Email sent successfully"))
              .catch((error) => console.log(error.message));

            res.redirect("/users/confirmation");
          });
        });
      }
    });
  }
});

// Redirecting user to the confirm email page
router.get("/confirmation", (req, res) => res.render("confirmEmail"));

router.get("/confirmed/:token", async (req, res) => {
  let theMail
  jwt.verify(req.params.token, EMAIL_SECRET, (err, email) => theMail=email);  
  await User.updateOne({ email: theMail }, { isConfirmed: true});
  res.render("confirmed");
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
