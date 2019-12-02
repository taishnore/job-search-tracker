const express = require("express");
const Employee = require("../models/Employee");
const Template = require("../models/Template");
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const replaceValues = require("../helper-methods/email-helpers");

const {
  accessTokenRemainingTime
} = require("../helper-methods/google-oauth-helpers");

const router = new express.Router();

router.post("/gmail/send/new", auth, async (req, res) => {
  console.log("req.body.emailObj:", req.body.emailObj);

  const user = req.user;
  const firstName = user.name.split(" ")[0];
  const lastName = user.name.split(" ")[1];
  const myEmail = user.google.email;
  const refresh_token = user.google.refresh_token;
  let access_token = user.google.access_token;

  const employee = await Employee.findOne({ _id: req.body.employeeId });

  const employeeEmail = employee.email;
  try {
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT,
      process.env.OAUTH_SECRET,
      process.env.REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refresh_token
    });

    //I dont think I need these lines; the nodemailer seems to renew the accesstoken if it needs to.
    // const tokenInfo = await accessTokenRemainingTime(access_token);
    //
    // // console.log({ tokenInfo });
    //
    // //i dont really need to get a new token.
    // if (tokenInfo.error) {
    //   console.log("I need a new access token!");
    //   access_token = await oauth2Client.getAccessToken();
    //   console.log({ access_token });
    //   user.google.access_token = access_token.token;
    //   await user.save();
    // }

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        type: "OAuth2",
        // user: myEmail,
        clientId: process.env.OAUTH_CLIENT,
        clientSecret: process.env.OAUTH_SECRET
        // refreshToken: refresh_token,
        // accessToken: access_token
      }
    });

    let mailOptions = {
      from: myEmail,
      to: employeeEmail,
      subject: req.body.emailObj.subject,
      text: req.body.emailObj.message,
      auth: {
        user: myEmail,
        refreshToken: refresh_token,
        // accessToken: access_token,
        expires: Date.now()
      }
    };

    if (req.body.emailObj.withResume) {
      console.log("user wants to send it with resume!");
      mailOptions.attachments = [
        {
          filename: `${firstName}-${lastName}-Resume.pdf`,
          content: user.resume
        }
      ];
    }

    await smtpTransport.sendMail(mailOptions, async (err, result) => {
      if (err) {
        console.log("in sendmail err", { err });
        return smtpTransport.close();
      }

      console.log({ result });

      employee.response = false;
      employee.emailsSent = [...employee.emailsSent, { method: "custom" }];
      await employee.save();

      res.send({ result });
    });
  } catch (err) {
    console.log("in the overall catch, here's the error", err);
    res.status(400).send(err);
  }
});

router.post("/gmail/send/template", auth, async (req, res) => {
  let template = await Template.findOne({ _id: req.body.templateId });
  const employee = await Employee.findOne({ _id: req.body.employeeId });
  const job = await Job.findOne({ _id: employee.owner });
  const user = req.user;
  const firstName = user.name.split(" ")[0];
  const lastName = user.name.split(" ")[1];
  const myEmail = user.google.email;
  const refresh_token = user.google.refresh_token;
  let emailsSent = employee.emailsSent;

  const employeeEmail = employee.email;
  try {
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT,
      process.env.OAUTH_SECRET,
      process.env.REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refresh_token
    });

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        type: "OAuth2",
        clientId: process.env.OAUTH_CLIENT,
        clientSecret: process.env.OAUTH_SECRET
      }
    });

    if (template.interpolationValues) {
      template = replaceValues(template, employee, job);
    }

    let mailOptions = {
      from: myEmail,
      to: employeeEmail,
      subject: template.subject,
      text: template.message,
      auth: {
        user: myEmail,
        refreshToken: refresh_token,
        expires: Date.now()
      }
    };

    if (template.withResume) {
      mailOptions.attachments = [
        {
          filename: `${firstName}-${lastName}-Resume.pdf`,
          content: user.resume
        }
      ];
    }

    await smtpTransport.sendMail(mailOptions, async (err, result) => {
      if (err) {
        console.log("in sendmail err", { err });
        return smtpTransport.close();
      }

      console.log({ result });

      employee.response = false;

      if (
        employee.emailsSent.length > 0 &&
        employee.emailsSent[0].method === undefined
      ) {
        console.log("in here, fixing it");
        employee.emailsSent[0].method = "template";
        employee.emailsSent[0].template_id = "5de53ba3fcfed33a8fc61e21";
      }

      if (typeof employee.emailsSent !== "number") {
        employee.emailsSent = [
          ...employee.emailsSent,
          { method: "template", template_id: template._id }
        ];
      } else {
        employee.emailsSent = [
          { method: "template", template_id: "5de53ba3fcfed33a8fc61e21" },
          { method: "template", template_id: template._id }
        ];
      }

      await employee.save();

      res.send({ result });
    });

    //crete method for replacing interpolated values
  } catch (err) {
    console.log("in gmail/send/template, here's the error:", err);
    res.status(400).send(err);
  }
});

module.exports = router;
