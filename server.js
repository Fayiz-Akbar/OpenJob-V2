require('dotenv').config();
const express = require('express');
const documentRoutes = require('./src/routes/documents'); // Tambahkan ini

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing
app.use('/documents', documentRoutes); // Tambahkan ini

app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'OpenJob API V2 is running!' });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});