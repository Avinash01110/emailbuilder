import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import emailRoutes from './routes/emailRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


connectDB();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/hi', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.use('/api', emailRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

