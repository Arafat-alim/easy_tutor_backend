const db = require("../config/db.js");
class Auth {
  static async create(user) {
    return db("users").insert(user);
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

  static async findByMobileAndUpdateForgotPasswordCode(mobile, hashedCode) {
    return db("users").where({ mobile, deleted_user: 0 }).update({
      forgot_password_code: hashedCode,
      forgot_password_code_validation: Date.now(),
    });
  }

  static async findByMobileAndUpdatePassword(mobile, password) {
    return db("users").where({ mobile, deleted_user: 0 }).update({
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

  static async findByMobileAndUpdateMobile(oldMobile, newMobile) {
    return db("users").where({ mobile: oldMobile, deleted_user: 0 }).update({
      mobile: newMobile,
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
}

module.exports = Auth;
