const db = require("../config/db.js");
class Auth {
  static async create(user) {
    return db("users").insert(user);
  }

  static async findByUserId(userId) {
    return db("users").where({ id: userId });
  }

  static async findByMobile(mobile) {
    return db("users").where({ mobile, deleted_user: 0 }).first();
  }

  static async findByEmail(email) {
    return db("users").where({ deleted_user: 0, email }).first();
  }

  static async findByMobileAndUpdateRole(mobile, role) {
    return db("users")
      .where({
        mobile,
        deleted_user: 0,
      })
      .update({ role });
  }

  static async findByEmailAndUpdateRole(email, role) {
    return db("users")
      .where({
        email,
        deleted_user: 0,
      })
      .update({ role });
  }

  static async findByEmailAndUpdateMobile(email, mobile) {
    return db("users")
      .where({
        email,
        deleted_user: 0,
      })
      .update({ mobile });
  }

  static async findByEmailAndUpdateForgotPasswordCode(email, hashedCode) {
    return db("users").where({ email, deleted_user: 0 }).update({
      forgot_password_code: hashedCode,
      forgot_password_code_validation: Date.now(),
    });
  }

  static async findByEmailAndUpdatePassword(email, password) {
    return db("users").where({ email, deleted_user: 0 }).update({
      password,
      forgot_password_code: null,
      forgot_password_code_validation: null,
    });
  }

  static async findByMobileAndUpdateMobileVerificationCode(mobile, hashedCode) {
    return db("users").where({ mobile, deleted_user: 0 }).update({
      mobile_verification_code: hashedCode,
      mobile_verification_code_validation: Date.now(),
      mobile_verified: 0,
    });
  }

  static async findByEmailAndVerifyOTP(mobile) {
    return db("users").where({ mobile, deleted_user: 0 }).update({
      mobile_verified: 1,
      mobile_verification_code: null,
      mobile_verification_code_validation: null,
    });
  }

  static async findByEmailAndGetSelectiveFields(email) {
    return db("users")
      .select(
        "id",
        "email",
        "username",
        "role",
        "email_verified",
        "mobile_verified"
      )
      .where({ email, deleted_user: 0 })
      .first();
  }
  static async findByEmailAndUpdateEmailVerificationCode(email, hashedCode) {
    return db("users")
      .where({
        email,
        email_verified: 0,
        deleted_user: 0,
      })
      .update({
        email_verification_code: hashedCode,
        email_verification_code_validation: Date.now(),
      });
  }

  static async findByUserIdAndUpdateEmailVerification(userId) {
    return db("users").where({ id: userId, deleted_at: null }).update({
      email_verified: 0,
    });
  }

  static async findByUserIdAndUpdateMobileVerification(userId) {
    return db("users")
      .where({
        id: userId,
        deleted_at: null,
      })
      .update({
        mobile_verified: 0,
      });
  }

  static async findByEmailAndVerify(email) {
    return db("users")
      .where({
        email,
        deleted_user: 0,
      })
      .update({
        email_verified: 1,
        email_verification_code: null,
        email_verification_code_validation: null,
      });
  }

  //! google signon
  static async findUserByGoogleId(google_id) {
    return db("users").where({ google_id }).first();
  }
}

module.exports = Auth;
