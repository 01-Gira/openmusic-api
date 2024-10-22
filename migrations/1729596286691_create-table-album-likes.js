/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    albumId: {
      type: 'VARCHAR(50)',
      references : '"albums"',
      onDelete: 'CASCADE',
      notNull: true
    },
    userId: {
      type: 'VARCHAR(50)',
      references : '"users"',
      onDelete: 'CASCADE',
      notNull: true
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('album_likes');
};
