const trimmer = (userData) => {
  const trimmedObj = {};
  for (let key in userData) {
    if (typeof userData[key] === "string") {
      trimmedObj[key] = userData[key].trim().toLowerCase();
    } else {
      trimmedObj[key] = userData[key].toLowerCase();
    }
  }
  return trimmedObj;
};

module.exports = trimmer;
