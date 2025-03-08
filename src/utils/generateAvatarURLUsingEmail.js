const generateAvatarURLUsingEmail = (email) => {
  if (typeof email !== "string" || !email.includes("@")) {
    throw new Error("Invalid email format");
  }

  const firstPhase = email.split("@")[0];
  const symbolicCharacters = [".", "_", "-", "+"]; // Common symbolic characters used in emails
  let arr = [];

  let delimiterFound = symbolicCharacters.find((char) =>
    firstPhase.includes(char)
  );
  if (delimiterFound) {
    arr = firstPhase.split(delimiterFound);
  } else {
    arr.push(firstPhase);
  }

  // Ensure safe URL encoding and generate a gravatar-style avatar URL
  const avatarName = arr.join("+");
  const avatarURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    avatarName
  )}&background=random&size=240`;

  return avatarURL;
};

module.exports = {
  generateAvatarURLUsingEmail,
};
