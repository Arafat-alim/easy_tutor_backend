const db = require("../config/db.js");

class Token {
  static async save(userId, refreshToken, expiredAt) {
    return db("tokens").insert({
      user_id: userId,
      refresh_token: refreshToken,
      expires_at: expiredAt,
    });
  }

  static async update(refreshToken, newRefreshToken, expiredAt) {
    return db("tokens").where({ refresh_token: refreshToken }).update({
      refresh_token: newRefreshToken,
      expires_at: expiredAt,
    });
  }

  static async delete(refreshToken) {
    return await db("tokens").where({ refresh_token: refreshToken }).del();
  }

  static async find(refreshToken) {
    return db("tokens").where({ refresh_token: refreshToken }).first();
  }
}
// new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

module.exports = Token;
