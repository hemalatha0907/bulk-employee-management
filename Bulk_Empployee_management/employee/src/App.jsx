import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/employees";
const salaryFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});
const getEmployees = () => axios.get(API);

function App() {
    const [employees, setEmployees] = useState([]);
    const [empCode, setEmpCode] = useState("");
    const [empName, setEmpName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [salary, setSalary] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("empCode");
    const [notice, setNotice] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editJobTitle, setEditJobTitle] = useState("");
    const [editSalary, setEditSalary] = useState("");
    const [editError, setEditError] = useState("");

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees();
            setEmployees(response.data.employees);
        } catch (error) {
            console.error(error);
            setNotice({
                type: "error",
                text: "Unable to load employees. Check the API and MongoDB Atlas connection."
            });
        }
    };

    useEffect(() => {
        let isMounted = true;

        getEmployees()
            .then((response) => {
                if (isMounted) {
                    setEmployees(response.data.employees);
                }
            })
            .catch((error) => {
                console.error(error);
                if (isMounted) {
                    setNotice({
                        type: "error",
                        text: "Unable to load employees. Check the API and MongoDB Atlas connection."
                    });
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const addEmployee = async (event) => {
        event.preventDefault();

        if (
            !empCode.trim() ||
            !empName.trim() ||
            !phoneNumber.trim() ||
            !email.trim() ||
            !jobTitle.trim() ||
            salary === ""
        ) {
            setNotice({ type: "error", text: "Please fill in all fields." });
            return;
        }

        try {
            const response = await axios.post(API, {
                empCode: empCode.trim().toUpperCase(),
                empName: empName.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim(),
                jobTitle: jobTitle.trim(),
                salary: Number(salary)
            });

            setEmpCode("");
            setEmpName("");
            setPhoneNumber("");
            setEmail("");
            setJobTitle("");
            setSalary("");
            setNotice({ type: "success", text: response.data.message });
            await fetchEmployees();
        } catch (error) {
            setNotice({
                type: "error",
                text: error.response?.data?.message || "Employee could not be added."
            });
        }
    };

    const startEditing = (employee) => {
        setEditingEmployee(employee);
        setEditName(employee.empName);
        setEditPhoneNumber(employee.phoneNumber || "");
        setEditEmail(employee.email || "");
        setEditJobTitle(employee.jobTitle || "");
        setEditSalary(String(employee.salary));
        setEditError("");
    };

    const saveEmployee = async (event) => {
        event.preventDefault();

        if (
            !editName.trim() ||
            !editPhoneNumber.trim() ||
            !editEmail.trim() ||
            !editJobTitle.trim() ||
            editSalary === ""
        ) {
            setEditError("Please fill in all fields.");
            return;
        }

        try {
            const response = await axios.put(
                `${API}/${encodeURIComponent(editingEmployee.empCode)}`,
                {
                    empName: editName.trim(),
                    phoneNumber: editPhoneNumber.trim(),
                    email: editEmail.trim(),
                    jobTitle: editJobTitle.trim(),
                    salary: Number(editSalary)
                }
            );
            setEditingEmployee(null);
            setEditError("");
            setNotice({ type: "success", text: response.data.message });
            await fetchEmployees();
        } catch (error) {
            setEditError(
                error.response?.data?.message || "Employee could not be updated."
            );
        }
    };

    const deleteEmployee = async (code) => {
        try {
            const response = await axios.delete(
                `${API}/${encodeURIComponent(code)}`
            );
            setNotice({ type: "success", text: response.data.message });
            await fetchEmployees();
        } catch (error) {
            setNotice({
                type: "error",
                text: error.response?.data?.message || "Employee could not be removed."
            });
        }
    };

    const normalizedSearch = search.trim().toLocaleLowerCase();
    const sortedEmployees = employees
        .filter((employee) =>
            employee.empName.toLocaleLowerCase().includes(normalizedSearch) ||
            employee.empCode.toLocaleLowerCase().includes(normalizedSearch) ||
            (employee.phoneNumber || "").toLocaleLowerCase().includes(normalizedSearch) ||
            (employee.email || "").toLocaleLowerCase().includes(normalizedSearch) ||
            (employee.jobTitle || "").toLocaleLowerCase().includes(normalizedSearch)
        )
        .sort((a, b) => {
            const codeOrder = a.empCode.localeCompare(b.empCode, undefined, {
                numeric: true,
                sensitivity: "base"
            });
            const nameOrder = a.empName.localeCompare(
                b.empName,
                undefined,
                { sensitivity: "base" }
            );

            return sortBy === "name"
                ? nameOrder || codeOrder
                : codeOrder || nameOrder;
        });

    return (
        <main className="app-shell" id="directory">
            <header className="page-heading">
                <div>
                    <h1>Employee directory</h1>
                    <p>Manage employee details in one place.</p>
                </div>
                <p className="employee-count">
                    {employees.length} {employees.length === 1 ? "employee" : "employees"}
                </p>
            </header>

            {notice && (
                <div className={`notice notice-${notice.type}`} role="status">
                    <span>{notice.text}</span>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="content-grid">
                <section className="panel add-panel" aria-labelledby="add-heading">
                    <h2 id="add-heading">Add employee</h2>
                    <form className="employee-form" onSubmit={addEmployee}>
                        <label>
                            Employee ID
                            <input
                                type="text"
                                placeholder="e.g. EMP-001"
                                value={empCode}
                                onChange={(event) => setEmpCode(event.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Employee name
                            <input
                                type="text"
                                placeholder="Employee name"
                                value={empName}
                                onChange={(event) => setEmpName(event.target.value)}
                                autoComplete="name"
                                required
                            />
                        </label>
                        <label>
                            Phone number
                            <input
                                type="tel"
                                placeholder="Phone number"
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                autoComplete="tel"
                                required
                            />
                        </label>
                        <label>
                            Email
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                required
                            />
                        </label>
                        <label>
                            Job title
                            <input
                                type="text"
                                placeholder="Job title"
                                value={jobTitle}
                                onChange={(event) => setJobTitle(event.target.value)}
                                autoComplete="organization-title"
                                required
                            />
                        </label>
                        <label>
                            Monthly salary
                            <span className="salary-input">
                                <span aria-hidden="true">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="0"
                                    value={salary}
                                    onChange={(event) => setSalary(event.target.value)}
                                    required
                                />
                            </span>
                        </label>
                        <button className="submit-button" type="submit">
                            Add employee
                        </button>
                    </form>
                    <p className="form-note">
                        Enter a unique employee ID. New records are saved to MongoDB Atlas.
                    </p>
                </section>

                <section className="panel directory-panel" aria-labelledby="directory-heading">
                    <div className="directory-heading">
                        <h2 id="directory-heading">Employees</h2>
                        <span>{sortedEmployees.length} found</span>
                    </div>

                    <div className="directory-controls">
                        <label className="search-field">
                            Search employees
                            <input
                                type="search"
                                placeholder="Search by name, ID, phone, email or job title"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                        <label className="sort-field">
                            Sort by
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                            >
                                <option value="empCode">Employee ID</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </label>
                    </div>

                    <div className="table-scroll">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Employee ID</th>
                                    <th scope="col">Phone</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Job title</th>
                                    <th scope="col">Monthly salary</th>
                                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedEmployees.map((employee) => (
                                    <tr key={employee.empCode}>
                                        <td>{employee.empName}</td>
                                        <td>{employee.empCode}</td>
                                        <td>{employee.phoneNumber || "—"}</td>
                                        <td>{employee.email || "—"}</td>
                                        <td>{employee.jobTitle || "—"}</td>
                                        <td>{salaryFormatter.format(employee.salary)}</td>
                                        <td className="action-cell">
                                            <button
                                                className="edit-button"
                                                type="button"
                                                onClick={() => startEditing(employee)}
                                                aria-label={`Edit ${employee.empName}`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="remove-button"
                                                type="button"
                                                onClick={() => deleteEmployee(employee.empCode)}
                                                aria-label={`Delete ${employee.empName}`}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {sortedEmployees.length === 0 && (
                            <p className="empty-state">
                                {search ? "No matching employees." : "No employees have been added yet."}
                            </p>
                        )}
                    </div>
                </section>
            </section>

            {editingEmployee && (
                <div className="modal-backdrop">
                    <section
                        className="edit-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-heading"
                    >
                        <div className="dialog-heading">
                            <h2 id="edit-heading">Edit employee</h2>
                            <button
                                type="button"
                                onClick={() => setEditingEmployee(null)}
                                aria-label="Close edit form"
                            >
                                ×
                            </button>
                        </div>
                        <p>Employee ID: {editingEmployee.empCode}</p>
                        {editError && <p className="dialog-error" role="alert">{editError}</p>}
                        <form className="employee-form edit-form" onSubmit={saveEmployee}>
                            <label>
                                Employee name
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Phone number
                                <input
                                    type="tel"
                                    value={editPhoneNumber}
                                    onChange={(event) => setEditPhoneNumber(event.target.value)}
                                    autoComplete="tel"
                                    required
                                />
                            </label>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(event) => setEditEmail(event.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </label>
                            <label>
                                Job title
                                <input
                                    type="text"
                                    value={editJobTitle}
                                    onChange={(event) => setEditJobTitle(event.target.value)}
                                    autoComplete="organization-title"
                                    required
                                />
                            </label>
                            <label>
                                Monthly salary
                                <span className="salary-input">
                                    <span aria-hidden="true">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={editSalary}
                                        onChange={(event) => setEditSalary(event.target.value)}
                                        required
                                    />
                                </span>
                            </label>
                            <div className="dialog-actions">
                                <button
                                    className="cancel-button"
                                    type="button"
                                    onClick={() => setEditingEmployee(null)}
                                >
                                    Cancel
                                </button>
                                <button className="submit-button" type="submit">
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default App;
