const generateEmailTemplate = require("./generateEmailTemplate");
const transport = require("./transport");

/**
 * Send an email using the provided details.
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.username - Recipient username.
 * @param {string} options.headerText - Header text for the email.
 * @param {string} options.bodyText - Body text for the email.
 * @param {string} options.actionText - Call-to-action text.
 * @param {string} options.actionUrl - Call-to-action URL.
 * @param {string} options.footerText - Footer text for the email.
 * @param {string} options.verificationCode - Verification code (if applicable).
 * @returns {Promise<void>}
 */
const sendEmail = async ({
  to,
  subject,
  username,
  headerText,
  bodyText,
  actionText,
  actionUrl,
  footerText,
  verificationCode,
}) => {
  try {
    const emailHtml = generateEmailTemplate({
      subject,
      headerText,
      bodyText,
      actionText,
      actionUrl,
      footerText,
      verificationCode,
    });

    await transport.sendMail({
      to,
      from: process.env.NODE_SENDING_EMAIL_ADDRESS,
      subject,
      username,
      html: emailHtml,
    });

    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email to:", to, error);
    throw error; // Re-throw the error for further handling
  }
};

module.exports = sendEmail;
