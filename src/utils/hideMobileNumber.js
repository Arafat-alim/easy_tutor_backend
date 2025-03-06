const hideMobileNumber = (mobile) => {
  const lastFourDigit = mobile.slice(6);
  return "XXXXXX" + lastFourDigit;
};

module.exports = {
  hideMobileNumber,
};
