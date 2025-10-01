

import express from 'express';
import cors from 'cors';
import { v2 as cloudinary } from "cloudinary"
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './db/dbconnection.js';
import userRoutes from './routes/user.js'
import storyRoutes from './routes/story.js'
const app = express();


app.use(express.json());
app.use(cors());

app.use('/api/user', userRoutes);
app.use('/api/story', storyRoutes);



const PORT = 3000;
 cloudinary.config({ 
 cloud_name:process.env.CLOUD_NAME, 
 api_key:process.env. CLOUD_API_KEY, 
 api_secret:process.env.API_SECRET_KEY 
 // Click 'View API Keys' above to copy your API secret
}); 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB()
});
