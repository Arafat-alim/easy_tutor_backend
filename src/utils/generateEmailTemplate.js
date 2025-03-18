/**
 * Generate an enhanced HTML email template.
 * @param {Object} options - Template options.
 * @param {string} options.subject - Email subject.
 * @param {string} options.headerText - Header text.
 * @param {string} options.bodyText - Body text.
 * @param {string} options.actionText - Call-to-action text.
 * @param {string} options.actionUrl - Call-to-action URL.
 * @param {string} options.footerText - Footer text.
 * @param {string} options.verificationCode - Verification code (if applicable).
 * @returns {string} - HTML email template.
 */
const generateEmailTemplate = ({
  username,
  subject,
  headerText,
  bodyText,
  actionText,
  actionUrl,
  footerText,
  verificationCode,
}) => {
  const primaryColor = process.env.PRIMARY_COLOR || "#FF416C";
  const secondaryColor = "#FF4B2B";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background-color: #f3f4f6;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: #fff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(to right, ${primaryColor}, ${secondaryColor});
                color: #fff;
                text-align: center;
                padding: 25px 20px;
                font-size: 24px;
                font-weight: bold;
            }
            .content {
                padding: 25px 20px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
                color: #555;
                margin-bottom: 20px;
            }
            .verification-code {
                font-size: 22px;
                font-weight: bold;
                color: #fff;
                background: linear-gradient(to right, ${primaryColor}, ${secondaryColor});
                padding: 12px 24px;
                border-radius: 8px;
                display: inline-block;
                margin: 20px 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .action-button {
                display: inline-block;
                margin: 20px 0;
                padding: 12px 24px;
                background: linear-gradient(to right, ${primaryColor}, ${secondaryColor});
                color: #ffffff;
                font-size: 16px;
                font-weight: bold;
                text-decoration: none;
                border-radius: 8px;
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
                transition: 0.3s;
            }
            .action-button:hover {
                opacity: 0.9;
            }
            .footer {
                text-align: center;
                font-size: 14px;
                color: #777;
                padding: 20px;
                border-top: 1px solid #ddd;
            }
            .footer a {
                color: ${primaryColor};
                text-decoration: none;
                font-weight: bold;
            }
            @media (max-width: 600px) {
                .email-container {
                    border-radius: 0;
                }
                .header {
                    font-size: 20px;
                    padding: 20px;
                }
                .content p {
                    font-size: 14px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">${headerText}</div>
            <div class="content">
                <p>${bodyText}</p>
                ${
                  actionText && actionUrl
                    ? `<a href="${actionUrl}" class="action-button">${actionText}</a>`
                    : ""
                }
                ${
                  verificationCode
                    ? `<div class="verification-code">${verificationCode}</div>`
                    : ""
                }
            </div>
            <div class="footer">
                <p>${footerText || "Thank you for choosing our service!"}</p>
                <p>
                    <a href="https://yourwebsite.com" target="_blank">Visit our website</a> |
                    <a href="https://yourwebsite.com/contact" target="_blank">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = generateEmailTemplate;
