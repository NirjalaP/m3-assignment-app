const path = require("path");
const auth = require("http-auth");
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose")

 const { check, validationResult } = require("express-validator");
 const router = express.Router();
 const Registration = mongoose.model("Registration");

 const basic = auth.basic({
    file: path.join(__dirname, "../users.htpasswd"),
});

 router.get("/", function (req, res) {
   res.render("form", { title: "Registration Form" });
 });
 
 router.post(
   "/",
   [
     check("name").isLength({ min: 1 }).withMessage("Please enter a name"),
     check("email").isLength({ min: 1 }).withMessage("Please enter an email"),
     check("username").isLength({ min: 1 }).withMessage("Please enter a username"),
     check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
   ],
   async (req, res) => {
     // console.log(req.body);
     const errors = validationResult(req);
     if (errors.isEmpty()) {const registration = new Registration(req.body);
      //generate salt to hash password
      const salt = await bcrypt.genSalt(10);

      //set userpassword to hash password
      registration.password = await bcrypt.hash(registration.password, salt);
      registration.save()
          .then(() => {
            res.send("Thank you for your registration!");
          })
          .catch((err) => {
            console.log(err);
            res.send("Sorry! Something went wrong.");
          });
     } else {
       res.render("form", {
         title: "Registration Form",
         errors: errors.array(),
         data: req.body,
       });
     }
   }
 );

 router.get(
    "/registrations",
    basic.check((req, res) => {
      Registration.find()
        .then((registrations) => {
          res.render("registrations", { title: "Listing registrations", registrations });
        })
        .catch(() => {
          res.send("Sorry! Something went wrong.");
        });
    })
  );
 module.exports = router;