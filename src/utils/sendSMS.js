const unirest = require("unirest");

const sendSMS = async (mobile, otpCode) => {
  const enabledMobileOTP = process.env.ENABLED_OTP || "true";
  try {
    if (!mobile || !otpCode) {
      return new Error("Mobile and OTP Codes are required");
    }

    if (enabledMobileOTP !== "true") {
      console.log("OTP sending is disabled.");
      return new Error("OTP Cannot be sent due to developer lock from backend");
    }
    console.log("Sending OTP...", enabledMobileOTP);

    const req = unirest("GET", process.env.SMS_PROVIDER);

    req.query({
      authorization: process.env.SMS_PROVIDER_AUTHORIZATION_TOKEN,
      sender_id: process.env.SMS_PROVIDER_SENDER_ID,
      message: process.env.SMS_PROVIDER_MESSAGE_ID,
      variables_values: otpCode,
      route: process.env.SMS_PROVIDER_ROUTE,
      numbers: mobile, // single or multiples number
    });

    req.headers({ "cache-control": "no-cache" });
    return new Promise((resolve, reject) => {
      req.end((res) => {
        if (res.error) {
          return reject(new Error(res.error));
        }

        if (!res.body.return) {
          return reject(new Error("Failed to send SMS"));
        }
        resolve(res.body);
      });
    });
  } catch (err) {
    console.error("SMS Sending Error:", error.message);
    throw error;
  }
};

module.exports = {
  sendSMS,
};
