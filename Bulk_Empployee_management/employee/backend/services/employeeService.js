// Remove duplicate employees using their employee ID.
const removeDuplicates = (employees) => {

    const employeeIds = new Set();

    return employees
        .slice()
        .reverse()
        .filter((employee) => {
            if (employeeIds.has(employee.empCode)) {
                return false;
            }

            employeeIds.add(employee.empCode);
            return true;
        })
        .reverse();

};


// Sort employees
const sortEmployees = (employees) => {

    return employees.sort((a, b) => {

        return a.empName.localeCompare(b.empName, undefined, { sensitivity: "base" }) ||
            a.empCode.localeCompare(b.empCode, undefined, {
                numeric: true,
                sensitivity: "base"
            });

    });

};


// Main processing function
const processEmployees = (employees) => {

    const uniqueEmployees = removeDuplicates(employees);

    const sortedEmployees = sortEmployees(uniqueEmployees);

    return sortedEmployees;

};

export default processEmployees;