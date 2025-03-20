const db = require("../config/db.js");

class Token {
  static async save(userId, refreshToken, expiredAt) {
    return db("tokens").insert({
      user_id: userId,
      refresh_token: refreshToken,
      expires_at: expiredAt,
    });
  }

  static async find(refreshToken) {
    return db("tokens").where({ refresh_token: refreshToken }).first();
  }
}

module.exports = Token;
