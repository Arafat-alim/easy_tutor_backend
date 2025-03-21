const db = require("../config/db.js");
class Auth {
  static async create(user) {
    return db("users").insert(user);
  }

  static async findByUserId(userId) {
    return db("users").where({ id: userId });
  }

  static async findByMobile(mobile) {
    return db("users").where({ mobile, deleted_at: null }).first();
  }

  static async findByEmail(email) {
    return db("users").where({ deleted_at: null, email }).first();
  }

  static async findByMobileAndUpdateRole(mobile, role) {
    return db("users")
      .where({
        mobile,
        deleted_at: null,
      })
      .update({ role });
  }

  static async findByEmailAndUpdateRole(email, role) {
    return db("users")
      .where({
        email,
        deleted_at: null,
      })
      .update({ role });
  }

  static async findByEmailAndUpdateMobile(email, mobile) {
    return db("users")
      .where({
        email,
        deleted_at: null,
      })
      .update({ mobile });
  }

  static async findByUserIdAndAddMobile(userId, mobile) {
    return db("users")
      .where({
        id: userId,
        deleted_at: null,
      })
      .update({ mobile });
  }

  static async findByEmailAndUpdateForgotPasswordCode(email, hashedCode) {
    return db("users").where({ email, deleted_at: null }).update({
      forgot_password_code: hashedCode,
      forgot_password_code_validation: Date.now(),
    });
  }

  static async findByUserIdAndUpdatePassword(userId, password) {
    return db("users").where({ id: userId, deleted_at: null }).update({
      password,
      forgot_password_code: null,
      forgot_password_code_validation: null,
    });
  }

  static async findByMobileAndUpdateMobileVerificationCode(mobile, hashedCode) {
    return db("users").where({ mobile, deleted_at: null }).update({
      mobile_verification_code: hashedCode,
      mobile_verification_code_validation: Date.now(),
      mobile_verified: 0,
    });
  }

  static async findByEmailAndVerifyOTP(mobile) {
    return db("users").where({ mobile, deleted_at: null }).update({
      mobile_verified: 1,
      mobile_verification_code: null,
      mobile_verification_code_validation: null,
    });
  }

  static async findByUserIdAndGetSelectiveFields(user_id) {
    return db("users")
      .select(
        "id",
        "email",
        "username",
        "role",
        "email_verified",
        "mobile_verified"
      )
      .where({ id: user_id, deleted_at: null })
      .first();
  }

  static async findByEmailAndUpdateEmailVerificationCode(email, hashedCode) {
    return db("users")
      .where({
        email,
        email_verified: 0,
        deleted_at: null,
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
        deleted_at: null,
      })
      .update({
        email_verified: 1,
        email_verification_code: null,
        email_verification_code_validation: null,
      });
  }

  static async findByUserIdAndValidateEmail(userId) {
    return db("users")
      .where({
        id: userId,
        deleted_at: null,
      })
      .update({
        email_verified: true,
      });
  }

  static async findByUserIdAndValidateMobile(userId) {
    return db("users")
      .where({
        id: userId,
        deleted_at: null,
      })
      .update({
        mobile_verified: true,
      });
  }

  static async findByUserIdAndDeleteUser(userId) {
    return db("users").where({ id: userId, deleted_at: null }).update({
      deleted_at: db.fn.now(),
    });
  }

  //! google signon
  static async findUserByGoogleId(google_id) {
    return db("users").where({ google_id }).first();
  }
}

module.exports = Auth;
