exports.up = (pgm) => {
  pgm.createTable('applications', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    cover_letter: { type: 'TEXT', notNull: true },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"', // Pelamar
      onDelete: 'CASCADE',
    },
    job_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"jobs"', // Lowongan yang dilamar
      onDelete: 'CASCADE',
    },
    status: { 
      type: 'TEXT', 
      notNull: true, 
      default: 'pending' 
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('applications');
};