require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'OpenJob API V2 is running!'
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});