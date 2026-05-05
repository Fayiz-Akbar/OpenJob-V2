require('dotenv').config();
const express = require('express');
const documentRoutes = require('./src/routes/documents'); 
const userRoutes = require('./src/routes/users'); // Tambahkan ini
const authRoutes = require('./src/routes/auth'); // Tambahkan ini
const bookmarksRouter = require('./src/routes/bookmarks');
const applicationsRouter = require('./src/routes/applications');
const companiesRouter = require('./src/routes/companies');
const jobsRouter = require('./src/routes/jobs');
const categoriesRouter = require('./src/routes/categories');
const { connectRabbitMQ } = require('./src/services/rabbitmq');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing
app.use('/users', userRoutes); // Tambahkan ini
app.use('/authentications', authRoutes); // Tambahkan ini
app.use('/documents', documentRoutes);
app.use('/bookmarks', bookmarksRouter);
app.use('/applications', applicationsRouter);
app.use('/companies', companiesRouter);
app.use('/jobs', jobsRouter);
app.use('/categories', categoriesRouter);

app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'OpenJob API V2 is running!' });
});

app.listen(port, async () => {
    await connectRabbitMQ(); // Jalankan koneksi RabbitMQ
    console.log(`Server berjalan di http://localhost:${port}`);
});