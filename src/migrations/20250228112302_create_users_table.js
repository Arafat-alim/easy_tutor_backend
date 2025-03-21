/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("email", 100).notNullable().index();
    table.string("google_id", 100).nullable();
    table.string("full_name", 100).nullable();
    table.string("mobile", 10).nullable().index();
    table.string("username", 100).notNullable().unique().index();
    table.string("password", 255);
    table.string("avatar", 300);
    table
      .enum("role", ["pending", "student", "teacher", "admin", "institute"])
      .defaultTo("pending");
    table.boolean("email_verified").defaultTo(false);
    table.boolean("mobile_verified").defaultTo(false);
    table.string("forgot_password_code", 100);
    table.string("forgot_password_code_validation", 100);
    table.boolean("is_blocked").defaultTo(false);
    table.timestamp("deleted_at").nullable().index(); // Added deleted_at column
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
