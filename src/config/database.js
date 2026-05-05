const { Pool } = require('pg');
require('dotenv').config();

// Mengambil kredensial dari file .env
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Menambahkan log untuk mengecek apakah koneksi berhasil
pool.connect((err, client, release) => {
  if (err) {
    console.error('Koneksi database gagal. Cek kembali kredensial di .env', err.stack);
  } else {
    console.log('Berhasil terhubung ke database PostgreSQL!');
  }
  if (client) release();
});

module.exports = pool;