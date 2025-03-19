const db = require("../config/db.js");

class Token {
  static async saveRefreshToken(refreshToken) {
    return db("tokens").insert({
      user_id: userId,
      refresh_token: refreshToken,
    });
  }

  static async findRefreshToken(refreshToken) {
    return db("tokens").where({ refresh_token: refreshToken }).first();
  }
}

module.exports = Token;
