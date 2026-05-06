exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'TEXT', notNull: true },
    description: { type: 'TEXT', notNull: true },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"', // Berelasi dengan tabel companies
      onDelete: 'CASCADE',
    },
    created_by: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"', // Berelasi dengan tabel users (Job Owner)
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};