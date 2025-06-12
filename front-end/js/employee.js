$(document).ready(function() {
    var email=localStorage.getItem('email');
    if (!email) {

        window.location.href = 'signin.html';
    }else {
        console.log('entering to employee page.!');
    }
});

$(document).ready(function() {
    const apiUrl = 'http://localhost:8080/JavaEE_Final_Project_EMS_Backend_Web_exploded/api/v1/employees';
    let currentEditId = null;
    let allEmployees = [];

    loadEmployees();
    
    $('#searchInput').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        const filteredEmployees = allEmployees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.mobile.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm) ||
            employee.address.toLowerCase().includes(searchTerm) ||
            employee.status.toLowerCase().includes(searchTerm)
        );
        refreshTable(filteredEmployees);
    });

    // Photo preview functionality
    $('#employeePhoto').on('change', function() {
        const file = this.files[0];
        const preview = $('#photoPreview');
        const placeholder = $('#photoPlaceholder');

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.attr('src', e.target.result).show();
                placeholder.hide();
            };
            reader.readAsDataURL(file);
        } else {
            preview.hide();
            placeholder.show();
        }
    });

    // Load employees from backend
    function loadEmployees() {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(response) {
                allEmployees = response || [];
                refreshTable(allEmployees);
            },
            error: function(xhr, status, error) {
                console.error('Error loading employees:', error);
                showAlert('Error loading employees', 'error');
            }
        });
    }

    // Refresh table with data
    function refreshTable(data) {
        const tbody = $('#employeeTableBody');
        const noDataMessage = $('#noDataMessage');

        if (!data || data.length === 0) {
            tbody.empty();
            noDataMessage.show();
            return;
        }

        noDataMessage.hide();
        tbody.empty();

        data.forEach(employee => {
            const statusBadge = getStatusBadge(employee.status);
            const departmentBadge = getDepartmentBadge(employee.department);

            const photoUrl = employee.photoUrl ?
                ('http://localhost:8080' + employee.photoUrl) :
                getDefaultPhotoUrl();

            console.log("main photo url: ", photoUrl);

            tbody.append(`
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${photoUrl}" 
                                 alt="${employee.name}" 
                                 class="employee-photo me-2"
                                 onerror="this.src='${getDefaultPhotoUrl()}'">
                            <div>
                                <div class="fw-semibold">${employee.name}</div>
                                <small class="text-muted" style="color: #94a3b8 !important;">${employee.mobile}</small>
                            </div>
                        </div>
                    </td>
                    <td>${employee.address}</td>
                    <td>${departmentBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary" onclick="editEmployee(${employee.id})" title="Edit">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})" title="Delete">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="viewEmployee(${employee.id})" title="View Details">
                                <i class="bi bi-eye-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `);
        });
    }


    function getDefaultPhotoUrl() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2Yzc1N2QiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMFYyMkgxOFYyMEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
    }


    function getStatusBadge(status) {
        const statusClasses = {
            'Active': 'badge bg-success',
            'Inactive': 'badge bg-secondary',
            'On Leave': 'badge bg-warning text-dark',
            'Terminated': 'badge bg-danger'
        };
        const className = statusClasses[status] || 'badge bg-secondary';
        return `<span class="${className}">${status}</span>`;
    }


    function getDepartmentBadge(department) {
        const colors = ['primary', 'info', 'warning', 'success', 'danger'];
        const hash = department.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        const colorIndex = Math.abs(hash) % colors.length;
        return `<span class="badge bg-${colors[colorIndex]}">${department}</span>`;
    }

    // Open add modal
    window.openAddModal = function() {
        currentEditId = null;
        $('#modalTitle').html('<i class="bi bi-person-plus-fill me-2"></i>Add Employee');
        $('#saveButton').text('Save Employee');
        $('#employeeForm')[0].reset();
        $('#photoPreview').hide();
        $('#photoPlaceholder').show();
        $('#employeeModal').modal('show');
    };

    // Edit employee
    window.editEmployee = function(id) {
        const employee = allEmployees.find(e => e.id === id);
        if (!employee) return;

        currentEditId = id;
        $('#modalTitle').html('<i class="bi bi-pencil-fill me-2"></i>Edit Employee');
        $('#saveButton').text('Update Employee');

        // Fill form fields
        $('#employeeName').val(employee.name);
        $('#employeeMobile').val(employee.mobile);
        $('#employeeAddress').val(employee.address);
        $('#employeeDepartment').val(employee.department);
        $('#employeeStatus').val(employee.status);

        // Show current photo if exists
        if (employee.photoUrl) {
            $('#photoPreview').attr('src', employee.photoUrl).show();
            $('#photoPlaceholder').hide();
        } else {
            $('#photoPreview').hide();
            $('#photoPlaceholder').show();
        }

        // Clear the file input
        $('#employeePhoto').val('');

        $('#employeeModal').modal('show');
    };

    // View employee details
    window.viewEmployee = function(id) {
        const employee = allEmployees.find(e => e.id === id);
        if (!employee) return;

        $('#viewEmployeeName').text(employee.name);
        $('#viewEmployeeMobile').text(employee.mobile);
        $('#viewEmployeeAddress').text(employee.address);
        $('#viewEmployeeDepartment').text(employee.department);
        $('#viewEmployeeStatus').html(getStatusBadge(employee.status));

        if (employee.photoUrl) {
            console.log('employee URL: ', employee.photoUrl);
            $('#viewEmployeePhoto').attr('src', 'http://localhost:8080' + employee.photoUrl).show(); //need change here
        } else {
            $('#viewEmployeePhoto').attr('src', getDefaultPhotoUrl()).show();
        }

        $('#viewModal').modal('show');
    };


    window.saveEmployee = function() {
        const form = $('#employeeForm')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }


        const formData = new FormData();
        formData.append('employeeName', $('#employeeName').val());
        formData.append('employeeMobile', $('#employeeMobile').val());
        formData.append('employeeAddress', $('#employeeAddress').val());
        formData.append('employeeDepartment', $('#employeeDepartment').val());
        formData.append('employeeStatus', $('#employeeStatus').val());


        const photoFile = $('#employeePhoto')[0].files[0];
        if (photoFile) {
            formData.append('employeePhoto', photoFile);
        }


        const saveBtn = $('#saveButton');
        const originalText = saveBtn.text();
        saveBtn.prop('disabled', true).text('Saving...');


        const url = currentEditId ? `${apiUrl}/${currentEditId}` : apiUrl;
        const method = currentEditId ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#employeeModal').modal('hide');
                loadEmployees();
                showAlert(
                    currentEditId ? 'Employee updated successfully!' : 'Employee added successfully!',
                    'success'
                );
            },
            error: function(xhr, status, error) {
                console.error('Error saving employee:', error);
                let errorMessage = 'Error saving employee';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                showAlert(errorMessage, 'error');
            },
            complete: function() {
                saveBtn.prop('disabled', false).text(originalText);
            }
        });
    };

    // Delete employee
    window.deleteEmployee = function(id) {
        const employee = allEmployees.find(e => e.id === id);
        if (!employee) return;

        $('#deleteEmployeeName').text(employee.name);
        $('#confirmDeleteBtn').off('click').on('click', () => confirmDelete(id));
        $('#deleteModal').modal('show');
    };

    // Confirm delete
    function confirmDelete(id) {
        const deleteBtn = $('#confirmDeleteBtn');
        const originalText = deleteBtn.text();
        deleteBtn.prop('disabled', true).text('Deleting...');

        $.ajax({
            url: `${apiUrl}/${id}`,
            method: 'DELETE',
            success: function() {
                $('#deleteModal').modal('hide');
                loadEmployees();
                showAlert('Employee deleted successfully!', 'success');
            },
            error: function(xhr, status, error) {
                console.error('Error deleting employee:', error);
                let errorMessage = 'Error deleting employee';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                showAlert(errorMessage, 'error');
            },
            complete: function() {
                deleteBtn.prop('disabled', false).text(originalText);
            }
        });
    }

    // Show alert messages
    function showAlert(message, type = 'info') {
        const alertClass = type === 'success' ? 'alert-success' :
            type === 'error' ? 'alert-danger' :
                type === 'warning' ? 'alert-warning' : 'alert-info';

        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="bi bi-${type === 'success' ? 'check-circle' :
            type === 'error' ? 'exclamation-triangle' :
                type === 'warning' ? 'exclamation-triangle' : 'info-circle'}-fill me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Remove existing alerts
        $('.alert').remove();

        // Add new alert at the top of the page
        $('body').prepend(alertHtml);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            $('.alert').fadeOut(() => $('.alert').remove());
        }, 5000);
    }

    // Export functions for global access
    window.employeeManager = {
        loadEmployees,
        openAddModal,
        editEmployee,
        deleteEmployee,
        viewEmployee,
        saveEmployee
    };
});