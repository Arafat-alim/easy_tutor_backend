/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("otp_verifications", (table) => {
    table.increments("id").primary();
    table
      .uuid("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable();
    table.string("otp_code", 10).notNullable();
    table.string("hashed_code", 100).nullable();
    table.enum("type", ["email", "mobile"]).notNullable();
    table.boolean("verified").defaultTo(false);
    table.timestamp("expires_at").notNullable();
    table.timestamp("deleted_at");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("otp_verifications");
};
