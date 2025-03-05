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
    table.string("mobile", 10).unique();
    table.string("username", 100);
    table.string("password", 100);
    table.string("avatar", 300);
    table
      .enum("role", ["pending", "student", "teacher", "admin", "institute"])
      .defaultTo("pending");
    table.boolean("email_verified").defaultTo(false);
    table.string("email_verification_code", 100);
    table.string("email_verification_code_validation", 100);
    table.boolean("mobile_verified").defaultTo(false);
    table.string("mobile_verification_code", 100);
    table.string("mobile_verification_code_validation", 100);
    table.string("forgot_password_code", 100);
    table.string("forgot_password_code_validation", 100);
    table.boolean("deleted_user").defaultTo(false);
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
