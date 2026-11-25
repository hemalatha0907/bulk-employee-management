import mongoose from "mongoose";
import Employee from "../models/Employee.js";

const connectDB = async () => {

    try {

        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not configured in backend/.env");
        }

        await mongoose.connect(mongoUri);

        const collections = await mongoose.connection.db
            .listCollections({ name: Employee.collection.name }, { nameOnly: true })
            .toArray();

        if (collections.length > 0) {
            const indexes = await Employee.collection.indexes();
            const legacyEmployeeIdIndex = indexes.find(
                (index) =>
                    index.unique &&
                    index.key.employeeId === 1 &&
                    Object.keys(index.key).length === 1
            );

            if (legacyEmployeeIdIndex) {
                await Employee.collection.dropIndex(legacyEmployeeIdIndex.name);
            }
        }

        console.log("MongoDB Connected Successfully");

    } catch (error) {

        console.log("MongoDB Connection Failed:", error.message);

        throw error;

    }

};

export default connectDB;