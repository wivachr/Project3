require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// New-style uploads: /uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Old-style paths from Project2: 2553-1/531001.pdf (no /uploads/ prefix in DB)
app.use('/', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/exams',    require('./routes/exams'));
app.use('/api/news',     require('./routes/news'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/registers', require('./routes/registers'));
app.use('/api/lookups',   require('./routes/lookups'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/races',     require('./routes/races'));
app.use('/api/headofdepartment', require('./routes/headofdepartment'));

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
