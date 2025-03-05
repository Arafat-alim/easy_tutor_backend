const generateUsername = (email) => {
  return email.split("@")[0].toLowerCase() + Date.now();
};

module.exports = generateUsername;
