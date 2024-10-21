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
  pgm.createTable('playlist_songs', {
    id: {
      type : 'VARCHAR(50)',
      primaryKey: true,
    },
    songId : {
      type : 'VARCHAR(50)',
      references : '"songs"',
      onDelete: 'CASCADE',
      notNull: true
    },
    playlistId : {
      type : 'VARCHAR(50)',
      references : '"playlists"',
      onDelete: 'CASCADE',
      notNull: true
    }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
