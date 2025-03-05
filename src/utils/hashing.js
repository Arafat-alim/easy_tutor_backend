const { hash, compare, genSalt } = require("bcryptjs");
const { createHmac } = require("crypto");

const hmacProcess = async (value, key) => {
  try {
    if (!key) {
      throw new Error("Key is missing");
    } else if (!value) {
      throw new Error("While process hmac, value is missing");
    }
    return createHmac("sha256", key).update(value).digest("hex");
  } catch (err) {
    console.error("Failed to create hmac", err);
    throw err;
  }
};

const doHash = async (value, saltValue = 12) => {
  try {
    if (!value) {
      throw new Error("Value is missing");
    }
    const salt = await genSalt(saltValue);
    return hash(value, salt);
  } catch (err) {
    console.error("Failed to encryption of password ", err);
    throw err;
  }
};

const doHashValidation = async (password, hashedPassword) => {
  try {
    if (!password) {
      throw new Error("Input password is missing");
    } else if (!hashedPassword) {
      throw new Error("Hashed password is missing");
    }
    return compare(password, hashedPassword);
  } catch (err) {
    console.error("Failed to encruption of password ", err);
    throw err;
  }
};

module.exports = {
  hmacProcess,
  doHash,
  doHashValidation,
};
