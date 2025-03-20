const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const verifyGoogleToken = async (googleToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token: No payload found");
    }
    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (payload.exp < currentTime) {
      throw new Error("Google token has expired. Please sign in again.");
    }
    return payload;
  } catch (err) {
    console.error("Error occured: ", err);
    throw err;
  }
};

module.exports = { verifyGoogleToken };
