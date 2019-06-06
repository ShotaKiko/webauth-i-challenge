
exports.up = async function(knex) {
  await knex.schema.createTable('users', tbl => {
      tbl.increments();
      tbl.string('username', 32).notNullable().unique()
      tbl.string('password', 20).notNullable()
  })
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users')
};
