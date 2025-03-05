const nodeMailer = require("nodemailer");

/**
 * Create a nodemailer transport instance.
 * @param {Object} options - Transport options.
 * @param {string} options.service - Email service (e.g., "gmail").
 * @param {string} options.auth.user - Sender email address.
 * @param {string} options.auth.pass - Sender email password.
 * @returns {Object} - Nodemailer transport instance.
 */
const createTransport = ({ service, auth }) => {
  return nodeMailer.createTransport({
    service,
    auth,
  });
};

// Default transport configuration (can be overridden)
const transport = createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_SENDING_EMAIL_ADDRESS,
    pass: process.env.NODE_SENDING_EMAIL_PASSWORD,
  },
});

module.exports = transport;
