import Employee from "../models/Employee.js";

import processEmployees from "../services/employeeService.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidEmployeeDetails = ({ empName, phoneNumber, email, jobTitle, salary }) =>
    typeof empName === "string" &&
    Boolean(empName.trim()) &&
    typeof phoneNumber === "string" &&
    Boolean(phoneNumber.trim()) &&
    typeof email === "string" &&
    isValidEmail(email.trim()) &&
    typeof jobTitle === "string" &&
    Boolean(jobTitle.trim()) &&
    salary !== undefined &&
    salary !== null &&
    salary !== "" &&
    Number.isFinite(Number(salary)) &&
    Number(salary) >= 0;

// Add Employee
export const addEmployee = async (req, res) => {

    try {

        const { empCode, empName, phoneNumber, email, jobTitle, salary } = req.body;

        if (
            typeof empCode !== "string" ||
            !empCode.trim() ||
            !isValidEmployeeDetails({ empName, phoneNumber, email, jobTitle, salary })
        ) {
            return res.status(400).json({
                message: "Please provide a valid employee ID and employee details"
            });
        }

        const normalizedEmpCode = empCode.trim().toUpperCase();
        let employee;

        try {
            employee = await Employee.create({
                empCode: normalizedEmpCode,
                empName: empName.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim().toLowerCase(),
                jobTitle: jobTitle.trim(),
                salary: Number(salary)
            });
        } catch (error) {
            const isEmployeeCodeConflict =
                error.code === 11000 &&
                (error.keyPattern?.empCode !== undefined ||
                    error.keyValue?.empCode !== undefined);

            if (isEmployeeCodeConflict) {
                return res.status(409).json({
                    message: "That employee ID already exists. Please use a different ID."
                });
            }

            throw error;
        }

        res.status(201).json({
            message: "Employee added successfully",
            employee
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// Get All Employees
export const getEmployees = async (req, res) => {

    try {

        const employees = await Employee.find()
            .collation({ locale: "en", strength: 2 })
            .sort({ empName: 1, empCode: 1 });

        res.status(200).json({
            totalEmployees: employees.length,
            employees
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Update Employee
export const updateEmployee = async (req, res) => {
    try {
        const { empName, phoneNumber, email, jobTitle, salary } = req.body;

        if (!isValidEmployeeDetails({ empName, phoneNumber, email, jobTitle, salary })) {
            return res.status(400).json({
                message: "Please provide valid employee details"
            });
        }

        const employee = await Employee.findOneAndUpdate(
            { empCode: req.params.empCode },
            {
                $set: {
                    empName: empName.trim(),
                    phoneNumber: phoneNumber.trim(),
                    email: email.trim().toLowerCase(),
                    jobTitle: jobTitle.trim(),
                    salary: Number(salary)
                }
            },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee updated successfully",
            employee
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Bulk Employee Processing
export const bulkCreateEmployees = async (req, res) => {

    try {

        const employees = req.body;

        if (!Array.isArray(employees) || employees.length === 0) {

            return res.status(400).json({
                message: "Please provide an employee array"
            });

        }

        // Validate employee records
        for (const emp of employees) {

            if (
                !emp ||
                typeof emp.empCode !== "string" ||
                !emp.empCode.trim() ||
                typeof emp.empName !== "string" ||
                !emp.empName.trim() ||
                (emp.phoneNumber !== undefined && typeof emp.phoneNumber !== "string") ||
                (emp.email !== undefined && typeof emp.email !== "string") ||
                (emp.email && !isValidEmail(emp.email.trim())) ||
                (emp.jobTitle !== undefined && typeof emp.jobTitle !== "string") ||
                emp.salary === undefined ||
                emp.salary === null ||
                emp.salary === "" ||
                !Number.isFinite(Number(emp.salary)) ||
                Number(emp.salary) < 0
            ) {

                return res.status(400).json({
                    message: "Invalid employee data"
                });

            }

        }

        const validEmployees = employees.map(emp => ({
            empCode: emp.empCode.trim(),
            empName: emp.empName.trim(),
            ...(emp.phoneNumber !== undefined && {
                phoneNumber: emp.phoneNumber.trim()
            }),
            ...(emp.email !== undefined && {
                email: emp.email.trim().toLowerCase()
            }),
            ...(emp.jobTitle !== undefined && {
                jobTitle: emp.jobTitle.trim()
            }),
            salary: Number(emp.salary)
        }));

        // DSA processing
        const processedEmployees = processEmployees(validEmployees);

        // Save multiple employees
        const operations = processedEmployees.map(emp => {
            const fieldsToUpdate = {
                empName: emp.empName,
                salary: emp.salary
            };

            if (emp.phoneNumber !== undefined) {
                fieldsToUpdate.phoneNumber = emp.phoneNumber;
            }
            if (emp.email !== undefined) {
                fieldsToUpdate.email = emp.email;
            }
            if (emp.jobTitle !== undefined) {
                fieldsToUpdate.jobTitle = emp.jobTitle;
            }

            return {
                updateOne: {
                    filter: { empCode: emp.empCode },
                    update: { $set: fieldsToUpdate },
                    upsert: true
                }
            };
        });

        await Employee.bulkWrite(operations);

        const allEmployees = await Employee.find()
            .collation({ locale: "en", strength: 2 })
            .sort({ empName: 1, empCode: 1 });

        res.status(200).json({

            message: "Bulk processing completed successfully",

            totalReceived: employees.length,

            totalUnique: processedEmployees.length,

            duplicatesRemoved:
                employees.length - processedEmployees.length,

            employees: allEmployees

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// Delete Employee
export const deleteEmployee = async (req, res) => {

    try {

        const employee = await Employee.findOneAndDelete({
            empCode: req.params.empCode
        });

        if (!employee) {

            return res.status(404).json({
                message: "Employee not found"
            });

        }

        res.status(200).json({
            message: "Employee deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};