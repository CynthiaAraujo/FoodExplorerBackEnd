exports.up = function(knex) {
  return knex.schema.createTable('plates', function(table) {
    table.increments('id');
    table.string('title');
    table.string('description');
    table.integer('price');
    table.string('type');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('img');
  }).then(function() {
    return knex.schema.createTable('plate_images', function(table) {
      table.increments('id');
      table.integer('plate_id').unsigned().references('plates.id').onDelete('CASCADE');
      table.string('filename');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('plate_images').then(function() {
    return knex.schema.dropTable('plates');
  });
};
