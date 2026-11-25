import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({

    empCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    empName: {
        type: String,
        required: true,
        trim: true
    },

    phoneNumber: {
        type: String,
        trim: true
    },

    email: {
        type: String,
        trim: true,
        lowercase: true
    },

    jobTitle: {
        type: String,
        trim: true
    },

    salary: {
        type: Number,
        required: true,
        min: 0
    }

}, {
    timestamps: true
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;