const trimmer = (userData) => {
  const trimmedObj = {};
  for (let key in userData) {
    if (typeof userData[key] === "string") {
      trimmedObj[key] = userData[key].trim();
    } else {
      trimmedObj[key] = userData[key];
    }
  }
  return trimmedObj;
};

module.exports = trimmer;
