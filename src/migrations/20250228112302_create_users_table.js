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
    table.string("email", 100).notNullable().unique();
    table.string("google_id", 100).nullable();
    table.string("first_name", 100).nullable();
    table.string("last_name", 100).nullable();
    table.string("mobile", 10).unique();
    table.string("username", 100).unique().notNullable();
    table.string("password", 255);
    table.string("avatar", 300);
    table
      .enum("role", ["pending", "student", "teacher", "admin", "institute"])
      .defaultTo("pending");
    table.boolean("email_verified").defaultTo(false);
    table.boolean("mobile_verified").defaultTo(false);
    table.string("forgot_password_code", 100);
    table.string("forgot_password_code_validation", 100);
    table.boolean("deleted_user").defaultTo(false);
    table.timestamp("deleted_at").nullable(); // Added deleted_at column
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
