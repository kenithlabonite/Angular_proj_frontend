
        // In-memory data store
        let users = [
            { id: 1, email: 'admin@example.com' },
            { id: 2, email: 'user@example.com' },
            { id: 3, email: 'user2@example.com' }
        ];

        let accounts = [
            { id: 1, title: 'Mr', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'Admin', status: 'Active' },
            { id: 2, title: 'Ms', firstName: 'Normal', lastName: 'User', email: 'user@example.com', role: 'User', status: 'Active' },
            { id: 3, title: 'Dr', firstName: 'Inactive', lastName: 'Person', email: 'inactive@example.com', role: 'User', status: 'Inactive' }
        ];

        let employees = [
            { id: 1, employeeId: 'EMP001', userId: 1, /* accountId: 1, */ position: 'Developer', departmentId: 1, hireDate: '2025-01-01', status: 'Active' },
            { id: 2, employeeId: 'EMP002', userId: 2, /* accountId: 2, */ position: 'Designer', departmentId: 2, hireDate: '2025-02-01', status: 'Active' }
        ];

        let departments = [
            { id: 1, name: 'Engineering', description: 'Software development team' },
            { id: 2, name: 'Marketing', description: 'Marketing team' }
        ];

        let workflows = [
            { id: 1, employeeId: 1, type: 'Onboarding', details: { task: 'Setup workstation' }, status: 'Pending' }
        ];

        let requests = [
            { id: 1, employeeId: 2, type: 'Equipment', requestItems: [{ name: 'Laptop', quantity: 1 }], status: 'Pending' },
            { id: 2, employeeId: 1, type: 'Leave', requestItems: [{ name: 'Vacation', quantity: 5 }], status: 'Approved' }
        ];

        let currentEmployeeId = null;
        let currentWorkflowEmployeeId = null;
        let currentEditId = null;
        let alertTimeout = null; // To manage the alert timeout

        // --- Helper Functions ---
        function showGlobalAlert(message, type = 'success') {
            const placeholder = document.getElementById('global-alert-placeholder');
            const alertType = type === 'info' ? 'alert-info' : (type === 'error' ? 'alert-danger' : 'alert-success'); // Map type to Bootstrap class
            placeholder.innerHTML = `
                <div class="alert ${alertType} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;

            // Clear previous timeout if exists
            if (alertTimeout) {
                clearTimeout(alertTimeout);
            }

            // Auto-dismiss after 5 seconds
            alertTimeout = setTimeout(() => {
                const alertElement = placeholder.querySelector('.alert');
                if (alertElement) {
                    // Use Bootstrap's static method to get instance or create it
                    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
                    if (bsAlert) { // Check if instance was successfully obtained/created
                         bsAlert.close();
                    }
                }
            }, 5000); // 5000 milliseconds = 5 seconds
        }

        // Navigation
        function showSection(section) {
             // Clear any existing global alert when changing sections
            const placeholder = document.getElementById('global-alert-placeholder');
            if (placeholder) placeholder.innerHTML = '';
            if (alertTimeout) clearTimeout(alertTimeout); // Clear timeout too

            document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
            document.getElementById(`${section}-section`).classList.remove('hidden');
            if (section === 'employees') renderEmployees();
            if (section === 'departments') renderDepartments();
            if (section === 'accounts') renderAccounts();
            if (section === 'workflows') renderWorkflows();
            if (section === 'requests') renderRequests();
        }

        // Employees
        function renderEmployees() {
            const tbody = document.getElementById('employees-table-body');
            tbody.innerHTML = '';
            employees.forEach(emp => {
                const account = accounts.find(account => account.id === emp.userId);
                const dept = departments.find(d => d.id === emp.departmentId);
                tbody.innerHTML += `
                    <tr>
                        <td>${emp.employeeId}</td>
                        <td>${account ? account.email : 'N/A'}</td>
                        <td>${emp.position}</td>
                        <td>${dept ? dept.name : 'N/A'}</td>
                        <td>${new Date(emp.hireDate).toLocaleDateString()}</td>
                        <td><span class="badge ${emp.status === 'Active' ? 'bg-success' : 'bg-danger'}">${emp.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info action-btn me-1" onclick="viewRequests(${emp.id})">Requests</button>
                            <button class="btn btn-sm btn-info action-btn me-1" onclick="viewWorkflows(${emp.id})">Workflows</button>
                            <button class="btn btn-sm btn-warning action-btn me-1" onclick="showTransferModal(${emp.id})">Transfer</button>
                            <button class="btn btn-sm btn-primary action-btn" onclick="showEmployeeForm(${emp.id})">Edit</button>
                        </td>
                    </tr>
                `;
            });
        }

        function showEmployeeForm(id) {
            currentEditId = id;
            document.getElementById('employee-form-title').textContent = id ? 'EDIT EMPLOYEE' : 'ADD EMPLOYEE';
            const employee = id ? employees.find(e => e.id === id) : null; // Find the employee being edited, if any
            document.getElementById('employee-id').value = employee ? employee.employeeId : `EMP${String(employees.length + 1).padStart(3, '0')}`;
            document.getElementById('employee-id').disabled = !!id;

            const userSelect = document.getElementById('employee-user');

            // 1. Start with accounts that are 'Active'
            let accountsToShow = accounts.filter(account => account.status === 'Active');

            // 2. Handle the edge case for editing:
            // If we are editing an existing employee (employee object exists)
            // AND that employee is currently assigned a userId
            if (employee && employee.userId) {
                // Find the full account object currently assigned to the employee
                const currentAssignedAccount = accounts.find(account => account.id === employee.userId);

                // If the currently assigned account exists BUT is Inactive
                // AND it's not already in our list (which it shouldn't be due to the filter, but check anyway)
                if (currentAssignedAccount && currentAssignedAccount.status === 'Inactive' && !accountsToShow.some(a => a.id === currentAssignedAccount.id)) {
                    // Add this specific inactive account to the list just for this edit session
                    accountsToShow.push(currentAssignedAccount);
                    // Optional: You might want to sort the list again if adding the inactive one messes up the order
                    // accountsToShow.sort((a, b) => a.email.localeCompare(b.email));
                }
            }

            // 3. Populate the dropdown using the filtered/augmented list
            userSelect.innerHTML = accountsToShow.map(account => {
                // Add a visual indicator "[Inactive]" for clarity if showing an inactive one
                const displayText = `${account.email} (${account.firstName} ${account.lastName})${account.status === 'Inactive' ? ' [Inactive]' : ''}`;
                // Check if this account should be selected (matches the employee being edited)
                const isSelected = employee && employee.userId === account.id;
                return `<option value="${account.id}" ${isSelected ? 'selected' : ''}>${displayText}</option>`;
            }).join('');

            // --- Rest of the function remains the same ---
            document.getElementById('employee-position').value = employee ? employee.position : '';
            const deptSelect = document.getElementById('employee-department');
            deptSelect.innerHTML = departments.map(d => `<option value="${d.id}" ${employee && employee.departmentId === d.id ? 'selected' : ''}>${d.name}</option>`).join('');
            document.getElementById('employee-hire-date').value = employee ? employee.hireDate : '';
            document.getElementById('employee-status').value = employee ? employee.status : 'Active';
            document.getElementById('employee-form-error').classList.add('hidden');
            showSection('employee-form');
        }

        function saveEmployee() {
            const employeeId = document.getElementById('employee-id').value;
            const userId = parseInt(document.getElementById('employee-user').value);
            // const accountId = document.getElementById('employee-account').value ? parseInt(document.getElementById('employee-account').value) : null; // REMOVED
            const position = document.getElementById('employee-position').value;
            const departmentId = parseInt(document.getElementById('employee-department').value);
            const hireDate = document.getElementById('employee-hire-date').value;
            const status = document.getElementById('employee-status').value;
            const error = document.getElementById('employee-form-error');

            // if (!employeeId || !userId || !position || !departmentId || !hireDate) { // Original check
            if (!employeeId || !userId || !position || !departmentId || !hireDate || !status) { // Updated check (accountId removed)
                // error.textContent = 'All fields except Account are required'; // Original message
                error.textContent = 'All fields are required'; // Updated message
                error.classList.remove('hidden');
                return;
            }

            if (currentEditId) {
                const employee = employees.find(e => e.id === currentEditId);
                employee.employeeId = employeeId;
                employee.userId = userId;
                employee.position = position;
                employee.departmentId = departmentId;
                employee.hireDate = hireDate;
                employee.status = status;
            } else {
                // *** Adding NEW employee ***

                // 1. Calculate the new Employee's internal ID
                // Use Math.max to handle potential gaps if deletion were implemented
                const newEmployeeInternalId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;

                // 2. Push the new employee object
                employees.push({
                    id: newEmployeeInternalId,
                    employeeId: employeeId,
                    userId,
                    // accountId, // REMOVED
                    position,
                    departmentId,
                    hireDate,
                    status
                });

                // 3. *** Automatically create a default workflow ***
                // Calculate new Workflow ID
                const newWorkflowId = workflows.length > 0 ? Math.max(...workflows.map(w => w.id)) + 1 : 1;

                // Define the default workflow object
                const defaultWorkflow = {
                    id: newWorkflowId,
                    employeeId: newEmployeeInternalId, // Link to the new employee's internal ID
                    type: 'Onboarding',
                    details: { task: 'Complete HR Forms', step: 1 }, // Example details
                    status: 'Pending'
                };

                // Add the workflow to the main workflows array
                workflows.push(defaultWorkflow);
                console.log('Added default workflow for new employee:', defaultWorkflow); // Optional: for debugging

                // You could add more default workflows here if needed by repeating step 3
                // Example: Add another workflow
                // const newWorkflowId2 = workflows.length > 0 ? Math.max(...workflows.map(w => w.id)) + 1 : 1;
                // workflows.push({
                //     id: newWorkflowId2,
                //     employeeId: newEmployeeInternalId,
                //     type: 'IT Setup',
                //     details: { task: 'Request Laptop', step: 1 },
                 //     status: 'Pending'
                 // });
                 showGlobalAlert(`Onboarding workflow created for new employee ${employeeId}.`, 'info'); // Workflow feedback
            }
            currentEditId = null;
            showSection('employees');
        }

        function showTransferModal(id) {
            currentEmployeeId = id;
            const employee = employees.find(e => e.id === id);
            document.getElementById('transferModalLabel').textContent = `Transfer Employee: ${employee.employeeId}`;
            const deptSelect = document.getElementById('transfer-department');
            deptSelect.innerHTML = departments.map(d => `<option value="${d.id}" ${employee.departmentId === d.id ? 'selected' : ''}>${d.name}</option>`).join('');
            const modal = new bootstrap.Modal(document.getElementById('transferModal'));
            modal.show();
        }

        function transferEmployee() {
            const newDepartmentId = parseInt(document.getElementById('transfer-department').value);
            const employee = employees.find(e => e.id === currentEmployeeId);

            // Ensure employee exists and department is actually changing
            if (!employee || employee.departmentId === newDepartmentId) {
                // If employee not found or department is the same, just close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('transferModal'));
                if (modal) { // Check if modal instance exists before hiding
                   modal.hide();
                }
                // Optionally, show a message if the department didn't change
                // alert('Employee is already in this department.');
                return; // Exit the function
            }

            const oldDepartmentId = employee.departmentId; // Store the old department ID

            // Update the employee's department
            employee.departmentId = newDepartmentId;

            // --- Add Workflow Logic ---
            // 1. Get Department Names for details (optional but nice)
            const oldDept = departments.find(d => d.id === oldDepartmentId);
            const newDept = departments.find(d => d.id === newDepartmentId);
            const oldDeptName = oldDept ? oldDept.name : 'Unknown Department';
            const newDeptName = newDept ? newDept.name : 'Unknown Department';

            // 2. Calculate new Workflow ID
            const newWorkflowId = workflows.length > 0 ? Math.max(...workflows.map(w => w.id)) + 1 : 1;

            // 3. Define the transfer workflow object
            const transferWorkflow = {
                id: newWorkflowId,
                employeeId: currentEmployeeId, // Link to the transferred employee's internal ID
                type: 'Department Transfer',
                details: {
                    message: `Employee transferred from ${oldDeptName} to ${newDeptName}.`,
                    previousDepartmentId: oldDepartmentId,
                    newDepartmentId: newDepartmentId
                 },
                status: 'Pending' // Or 'Completed' if it's just informational
            };

            // 4. Add the workflow to the main workflows array
            workflows.push(transferWorkflow);
            console.log('Added department transfer workflow:', transferWorkflow); // Optional: for debugging
            // --- End of Workflow Logic ---


// Hide the modal
const modal = bootstrap.Modal.getInstance(document.getElementById('transferModal'));
if (modal) { // Check if modal instance exists before hiding
   modal.hide();
}

// Re-render the employee list to show the updated department
renderEmployees();
renderDepartments(); // Added line to update department counts
showGlobalAlert(`Department transfer workflow created for employee ${employee.employeeId}.`, 'info'); // Workflow feedback
        }

        // Departments
        function renderDepartments() {
            const tbody = document.getElementById('departments-table-body');
            tbody.innerHTML = '';
            departments.forEach(dept => {
                const employeeCount = employees.filter(e => e.departmentId === dept.id).length;
                tbody.innerHTML += `
                    <tr>
                        <td>${dept.name}</td>
                        <td>${dept.description}</td>
                        <td>${employeeCount}</td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn me-1" onclick="showDepartmentForm(${dept.id})">Edit</button>
                        </td>
                    </tr>
                `;
            });
        }

        function showDepartmentForm(id) {
            currentEditId = id;
            document.getElementById('department-form-title').textContent = id ? 'EDIT DEPARTMENT' : 'ADD DEPARTMENT';
            const department = id ? departments.find(d => d.id === id) : null;
            document.getElementById('department-name').value = department ? department.name : '';
            document.getElementById('department-description').value = department ? department.description : '';
            document.getElementById('department-form-error').classList.add('hidden');
            showSection('department-form');
        }

        function saveDepartment() {
            const name = document.getElementById('department-name').value;
            const description = document.getElementById('department-description').value;
            const error = document.getElementById('department-form-error');

            if (!name || !description) {
                error.textContent = 'All fields are required';
                error.classList.remove('hidden');
                return;
            }

            if (currentEditId) {
                const department = departments.find(d => d.id === currentEditId);
                department.name = name;
                department.description = description;
            } else {
                departments.push({
                    id: departments.length + 1,
                    name,
                    description
                });
            }
            currentEditId = null;
            showSection('departments');
        }

        // Accounts
        function renderAccounts() {
            const tbody = document.getElementById('accounts-table-body');
            tbody.innerHTML = '';
            accounts.forEach(account => {
                tbody.innerHTML += `
                    <tr>
                        <td>${account.title}</td>
                        <td>${account.firstName}</td>
                        <td>${account.lastName}</td>
                        <td>${account.email}</td>
                        <td>${account.role}</td>
                        <td><span class="badge ${account.status === 'Active' ? 'bg-success' : 'bg-danger'}">${account.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn me-1" onclick="showAccountForm(${account.id})">Edit</button>
                            <!-- Add Delete button if needed -->
                        </td>
                    </tr>
                `;
            });
        }

        function showAccountForm(id) {
            currentEditId = id; // Use the global currentEditId
            document.getElementById('account-form-title').textContent = id ? 'EDIT ACCOUNT' : 'ADD ACCOUNT';
            const account = id ? accounts.find(a => a.id === id) : null;

            // Populate form fields
            document.getElementById('account-id').value = account ? account.id : ''; // Store ID if editing
            document.getElementById('account-title').value = account ? account.title : 'Mr';
            document.getElementById('account-firstName').value = account ? account.firstName : '';
            document.getElementById('account-lastName').value = account ? account.lastName : '';
            document.getElementById('account-email').value = account ? account.email : '';
            document.getElementById('account-role').value = account ? account.role : 'User';
            document.getElementById('account-status').value = account ? account.status : 'Active';

            document.getElementById('account-form-error').classList.add('hidden'); // Hide error message
            showSection('account-form');
        }

        function saveAccount() {
            // Read values from form
            const id = currentEditId; // Use the global currentEditId
            const title = document.getElementById('account-title').value;
            const firstName = document.getElementById('account-firstName').value;
            const lastName = document.getElementById('account-lastName').value;
            const email = document.getElementById('account-email').value;
            const role = document.getElementById('account-role').value;
            const status = document.getElementById('account-status').value;
            const error = document.getElementById('account-form-error');

            // Basic Validation
if (!firstName || !lastName || !email) {
    error.textContent = 'First Name, Last Name, and Email are required.';
    error.classList.remove('hidden');
    return;
} 

// else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/.test(email)) {
//     error.textContent = 'Invalid email format.';
//     error.classList.remove('hidden');
//     return;
// }
             // Optional: Add email format validation if desired

            if (id) {
                // Editing existing account
                const account = accounts.find(a => a.id === id);
                if (account) {
                    account.title = title;
                    account.firstName = firstName;
                    account.lastName = lastName;
                    account.email = email;
                    account.role = role;
                    account.status = status;
                }
            } else {
                // Adding new account
                const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1; // Simple way to get next ID
                accounts.push({
                    id: newId,
                    title,
                    firstName,
                    lastName,
                    email,
                    role,
                    status
                });
            }

            currentEditId = null; // Reset edit ID
            showSection('accounts'); // Go back to the accounts list
        }

        // Workflows
        function viewWorkflows(employeeId) {
            currentWorkflowEmployeeId = employeeId;
            const employee = employees.find(e => e.id === employeeId);
            document.getElementById('workflows-title').textContent = `WORKFLOWS FOR EMPLOYEE ${employee.employeeId}`;
            renderWorkflows();
            showSection('workflows');
        }

        function renderWorkflows() {
            const tbody = document.getElementById('workflows-table-body');
            tbody.innerHTML = ''; // Clear existing rows
            const employeeWorkflows = workflows.filter(w => w.employeeId === currentWorkflowEmployeeId);

            if (employeeWorkflows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No workflows found for this employee.</td></tr>';
                return; // Stop if no workflows
            }

            employeeWorkflows.forEach(w => {
                // 1. Determine Status Badge Class
                let statusClass = 'bg-secondary'; // Default/fallback
                let statusTextClass = ''; // For text color on specific badges
                switch (w.status) {
                    case 'Pending':
                        statusClass = 'bg-warning';
                        statusTextClass = 'text-dark'; // Dark text on yellow is often more readable
                        break;
                    case 'Approved':
                        statusClass = 'bg-success';
                        break;
                    case 'Rejected':
                        statusClass = 'bg-danger';
                        break;
                    // Add more cases if needed
                }

                // 2. Format Details Column (make it more readable than JSON)
                let detailsHtml = '';
                try {
                    if (typeof w.details === 'object' && w.details !== null) {
                        if (w.type === 'Onboarding' && w.details.task) {
                             detailsHtml = `Task: ${w.details.task}${w.details.step ? ' (Step ' + w.details.step + ')' : ''}`;
                        } else if (w.type === 'Department Transfer' && w.details.message) {
                             detailsHtml = w.details.message;
                        } else {
                            // Generic fallback for other object details
                            detailsHtml = Object.entries(w.details)
                                                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                                                .join('<br>');
                        }
                    } else {
                        detailsHtml = w.details; // Display as is if not a typical object
                    }
                } catch (e) {
                    console.error("Error formatting workflow details:", e);
                    detailsHtml = JSON.stringify(w.details); // Fallback to JSON on error
                }


                // 3. Build Table Row HTML
                tbody.innerHTML += `
                    <tr>
                        <td>${w.type}</td>
                        <td>${detailsHtml}</td>
                        <td>
                            <span class="badge ${statusClass} ${statusTextClass}">${w.status}</span>
                        </td>
                        <td>
                            <select class="form-select form-select-sm d-inline-block w-auto" onchange="updateWorkflowStatus(${w.id}, this.value)">
                                <option value="Pending" ${w.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Approved" ${w.status === 'Approved' ? 'selected' : ''}>Approved</option>
                                <option value="Rejected" ${w.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                <!-- Add other potential statuses here if needed -->
                            </select>
                        </td>
                    </tr>
                `;
            });
        }

        function updateWorkflowStatus(id, status) {
            const workflow = workflows.find(w => w.id === id);
            workflow.status = status;
            renderWorkflows();
        }

        // Requests
        function viewRequests(employeeId) {
            showSection('requests');
        }

        function renderRequests() {
            const tbody = document.getElementById('requests-table-body');
            tbody.innerHTML = ''; // Clear existing rows

            // 1. Handle case where there are no requests
            if (requests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No requests found.</td></tr>'; // Colspan matches number of columns
                return; // Stop if no requests
            }

            requests.forEach(req => {
                // 2. Get Employee and associated Account info for better display
                const employee = employees.find(e => e.id === req.employeeId);
                const account = employee ? accounts.find(acc => acc.id === employee.userId) : null;
                // Display account email/name if available, otherwise fallback to employee ID
                const employeeDisplay = account ? `${account.email} (${account.firstName} ${account.lastName})` : (employee ? employee.employeeId : 'N/A');

                // 3. Determine Status Badge Class
                let statusClass = 'bg-secondary'; // Default/fallback
                let statusTextClass = ''; // For text color on specific badges
                switch (req.status) {
                    case 'Pending':
                        statusClass = 'bg-warning';
                        statusTextClass = 'text-dark'; // Dark text on yellow is often more readable
                        break;
                    case 'Approved':
                        statusClass = 'bg-success';
                        break;
                    case 'Rejected':
                        statusClass = 'bg-danger';
                        break;
                    // Add more cases if needed (e.g., 'Processing', 'Completed')
                }

                // 4. Build Table Row HTML
                tbody.innerHTML += `
                    <tr>
                        <td>${req.type}</td>
                        <td>${employeeDisplay}</td> <!-- Use the enhanced display name -->
                        <td>
                            <!-- Use list-unstyled for less default styling, mb-0 to remove bottom margin -->
                            <ul class="list-unstyled mb-0">
                                ${req.requestItems.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
                            </ul>
                        </td>
                        <td>
                            <!-- Display status using a badge -->
                            <span class="badge ${statusClass} ${statusTextClass}">${req.status}</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn me-1" onclick="showRequestForm(${req.id})">Edit</button>
                            <!-- Consider adding Approve/Reject buttons here later -->
                        </td>
                    </tr>
                `;
            });
        }

        function showRequestForm(id) {
            currentEditId = id;
            document.getElementById('request-form-title').textContent = id ? 'EDIT REQUEST' : 'ADD REQUEST';
            const request = id ? requests.find(r => r.id === id) : null;
            document.getElementById('request-type').value = request ? request.type : 'Equipment';
            const employeeSelect = document.getElementById('request-employee');
            employeeSelect.innerHTML = employees.map(e => `<option value="${e.id}" ${request && request.employeeId === e.id ? 'selected' : ''}>${e.employeeId}</option>`).join('');
            const itemsDiv = document.getElementById('request-items');
            itemsDiv.innerHTML = '';
            if (request) {
                request.requestItems.forEach((item, index) => addRequestItem(item.name, item.quantity));
            } else {
                addRequestItem();
            }
            document.getElementById('request-form-error').classList.add('hidden');
            showSection('request-form');
        }

        function addRequestItem(name = '', quantity = 1) {
            const itemsDiv = document.getElementById('request-items');
            const index = itemsDiv.children.length;
            itemsDiv.innerHTML += `
                <div class="border p-2 mb-2" id="request-item-${index}">
                    <div class="row">
                        <div class="col-md-5">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-control request-item-name" value="${name}">
                        </div>
                        <div class="col-md-5">
                            <label class="form-label">Quantity</label>
                            <input type="number" class="form-control request-item-quantity" value="${quantity}" min="1">
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button class="btn btn-danger" onclick="removeRequestItem(${index})">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function removeRequestItem(index) {
            document.getElementById(`request-item-${index}`).remove();
        }

        function saveRequest() {
            const type = document.getElementById('request-type').value;
            const employeeId = parseInt(document.getElementById('request-employee').value);
            const items = Array.from(document.querySelectorAll('#request-items > div')).map(div => ({
                name: div.querySelector('.request-item-name').value,
                quantity: parseInt(div.querySelector('.request-item-quantity').value)
            }));
            const error = document.getElementById('request-form-error');

            if (!type || !employeeId || items.length === 0 || items.some(item => !item.name || !item.quantity)) {
                error.textContent = 'All fields are required';
                error.classList.remove('hidden');
                return;
            }

            if (currentEditId) {
                const request = requests.find(r => r.id === currentEditId);
                request.type = type;
                request.employeeId = employeeId;
                request.requestItems = items;
            } else {
                // requests.push({
                //     id: requests.length + 1,
                //     employeeId,
                //     type,
                //     requestItems: items,
                //     status: 'Pending'
                // });

                // *** Adding NEW request ***

                // 1. Calculate the new Request ID
                const newRequestId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;

                // 2. Push the new request object
                requests.push({
                    id: newRequestId,
                    employeeId, // Requester's ID
                    type,
                    requestItems: items,
                    status: 'Pending' // Initial status of the request
                });

                // 3. *** Automatically create a corresponding workflow ***
                // Calculate new Workflow ID
                const newWorkflowId = workflows.length > 0 ? Math.max(...workflows.map(w => w.id)) + 1 : 1;

                // Determine who the workflow is assigned to (e.g., a specific admin/manager ID)
                // For this demo, let's assume employee with internal ID 1 (Admin User) approves requests.
                const approverEmployeeId = 1; // Assign workflow task to employee ID 1

                // Define the approval workflow object
                const approvalWorkflow = {
                    id: newWorkflowId,
                    employeeId: approverEmployeeId, // Assign task to the approver
                    type: 'Request Approval',
                    details: {
                        requestId: newRequestId, // Link back to the request
                        requestType: type,
                        requesterId: employeeId, // Store who made the request
                        message: `Review ${type} request #${newRequestId} from Employee ID ${employeeId}.`
                    },
                    status: 'Pending' // Initial status of the workflow task
                };

                // Add the workflow to the main workflows array
                workflows.push(approvalWorkflow);
                console.log('Added request approval workflow:', approvalWorkflow); // Optional: for debugging
                showGlobalAlert(`Created ${type} approval workflow for request #${newRequestId} (Employee ID: ${employeeId})`, 'info');
            }
            currentEditId = null;
            showSection('requests');
        }

        // Initial render
        showSection('accounts');