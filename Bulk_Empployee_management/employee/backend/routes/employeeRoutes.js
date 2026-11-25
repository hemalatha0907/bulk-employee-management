import express from "express";

import {
    addEmployee,
    getEmployees,
    updateEmployee,
    bulkCreateEmployees,
    deleteEmployee
} from "../controllers/employeeController.js";

const router = express.Router();

// Add Employee
router.post("/", addEmployee);

// Get All Employees
router.get("/", getEmployees);

// Update Employee
router.put("/:empCode", updateEmployee);

// Bulk Processing
router.post("/bulk", bulkCreateEmployees);

// Delete Employee
router.delete("/:empCode", deleteEmployee);

export default router;