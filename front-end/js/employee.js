let employees = [];
let currentEditId = null;
let employeeIdCounter = 1001;

document.addEventListener('DOMContentLoaded', function() {
    loadSampleData();
    renderTable();

    document.getElementById('searchInput').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredEmployees = employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.id.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm) ||
            employee.mobile.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredEmployees);
    });
});

function loadSampleData() {
    employees = [
        {
            id: 'EMP1001',
            name: 'John Smith',
            mobile: '+1-555-0123',
            address: '123 Main St, New York, NY 10001',
            department: 'Information Technology',
            status: 'Active',
            photo: null
        },
        {
            id: 'EMP1002',
            name: 'Sarah Johnson',
            mobile: '+1-555-0456',
            address: '456 Oak Ave, Los Angeles, CA 90210',
            department: 'Human Resources',
            status: 'Active',
            photo: null
        },
        {
            id: 'EMP1003',
            name: 'Michael Brown',
            mobile: '+1-555-0789',
            address: '789 Pine Rd, Chicago, IL 60601',
            department: 'Finance',
            status: 'Inactive',
            photo: null
        }
    ];
    employeeIdCounter = 1004;
}

function renderTable(employeesToRender = employees) {
    const tbody = document.getElementById('employeeTableBody');
    const noDataMessage = document.getElementById('noDataMessage');

    if (employeesToRender.length === 0) {
        tbody.innerHTML = '';
        noDataMessage.style.display = 'block';
        return;
    }

    noDataMessage.style.display = 'none';

    tbody.innerHTML = employeesToRender.map(employee => `
                <tr>
                    <td><span class="badge badge-id">${employee.id}</span></td>
                    <td>
                        ${employee.photo
        ? `<img src="${employee.photo}" alt="${employee.name}" class="employee-photo">`
        : `<div class="employee-photo" style="background-color: var(--dark-surface); display: flex; align-items: center; justify-content: center; color: var(--text-muted);"><i class="bi bi-person"></i></div>`
    }
                    </td>
                    <td>${employee.name}</td>
                    <td>${employee.mobile}</td>
                    <td>${employee.address}</td>
                    <td><span class="badge badge-department">${employee.department}</span></td>
                    <td><span class="badge ${employee.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${employee.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-sm" onclick="editEmployee('${employee.id}')" title="Edit">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${employee.id}')" title="Delete">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
}

function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Add Employee';
    document.getElementById('saveButton').textContent = 'Save Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = `EMP${employeeIdCounter}`;

    // Reset photo preview
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPlaceholder').style.display = 'flex';
    document.getElementById('removePhotoBtn').style.display = 'none';

    new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

function editEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    currentEditId = id;
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil-fill me-2"></i>Edit Employee';
    document.getElementById('saveButton').textContent = 'Update Employee';

    document.getElementById('employeeId').value = employee.id;
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeeMobile').value = employee.mobile;
    document.getElementById('employeeAddress').value = employee.address;
    document.getElementById('employeeDepartment').value = employee.department;
    document.getElementById('employeeStatus').value = employee.status;

    // Handle photo preview
    if (employee.photo) {
        document.getElementById('photoPreview').src = employee.photo;
        document.getElementById('photoPreview').style.display = 'block';
        document.getElementById('photoPlaceholder').style.display = 'none';
        document.getElementById('removePhotoBtn').style.display = 'block';
    } else {
        document.getElementById('photoPreview').style.display = 'none';
        document.getElementById('photoPlaceholder').style.display = 'flex';
        document.getElementById('removePhotoBtn').style.display = 'none';
    }

    new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').src = e.target.result;
            document.getElementById('photoPreview').style.display = 'block';
            document.getElementById('photoPlaceholder').style.display = 'none';
            document.getElementById('removePhotoBtn').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removePhoto() {
    document.getElementById('employeePhoto').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPlaceholder').style.display = 'flex';
    document.getElementById('removePhotoBtn').style.display = 'none';
}

function saveEmployee() {
    const form = document.getElementById('employeeForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const photoElement = document.getElementById('photoPreview');
    const photoSrc = photoElement.style.display === 'block' ? photoElement.src : null;

    const employeeData = {
        id: document.getElementById('employeeId').value,
        name: document.getElementById('employeeName').value,
        mobile: document.getElementById('employeeMobile').value,
        address: document.getElementById('employeeAddress').value,
        department: document.getElementById('employeeDepartment').value,
        status: document.getElementById('employeeStatus').value,
        photo: photoSrc
    };

    if (currentEditId) {
        const index = employees.findIndex(e => e.id === currentEditId);
        employees[index] = employeeData;
    } else {
        employees.push(employeeData);
        employeeIdCounter++;
    }

    bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
    renderTable();
}

function deleteEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    document.getElementById('deleteEmployeeName').textContent = employee.name;
    document.getElementById('confirmDeleteBtn').onclick = () => confirmDelete(id);
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

function confirmDelete(id) {
    employees = employees.filter(e => e.id !== id);
    bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    renderTable();
}