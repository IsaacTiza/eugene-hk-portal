import dotenv from 'dotenv'
dotenv.config({path: './.env'})
import mongoose from "mongoose";
import app from './app.js'

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
    try{await mongoose.connect(process.env.MONGO_URI)
    console.log('Database connected successfully')}
    catch(error){
        console.error('Error connecting to database:', error)
        process.exit(1)
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB()
})
