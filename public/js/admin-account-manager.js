$(document).ready(function () {
    function loadAccounts() {
        $.get('/api/accounts', function (accounts) {
            const tableBody = $('#account-table-body');
            tableBody.empty();
            accounts.forEach(acc => {
                tableBody.append(`
                            <tr>
                                <td>${acc.email}</td>
                                <td>${acc.role}</td>
                                <td class="account-cells">
                                    <div class="account-buttons">
                                        <button class="btn edit-btn-account" data-id="${acc.id}" data-email="${acc.email}" data-role="${acc.role}">Edit</button>
                                        <button class="btn change-password-btn-account" data-id="${acc.id}" data-email="${acc.email}">Change Password</button>
                                        <button class="btn delete-btn-account" data-id="${acc.id}">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `);
            });
        });
    }

    function loadTeachersWithoutAccount() {
        const select = $('#add-email-select');
        select.html('<option value="">-- Loading teachers... --</option>');
        $.get('/api/teachers/no-account', function (teachers) {
            select.empty();
            if (teachers.length === 0) {
                select.append('<option value="">No teachers available to create accounts for</option>');
            } else {
                select.append('<option value="">-- Select a Teacher --</option>');
                teachers.forEach(teacher => {
                    select.append(`<option value="${teacher.email}">${teacher.full_name} (${teacher.email})</option>`);
                });
            }
        });
    }

    // Load teachers when the "Add Account" modal is shown
    $('#addAccountModal').on('show.bs.modal', function () {
        loadTeachersWithoutAccount();
    });

    $('#addAccountForm').submit(function (e) {
        e.preventDefault();
        $.post('/api/accounts/add', {
            email: $('#add-email-select').val(),
            password: $('#add-password').val(),
            role: $('#add-role').val()
        }, function () {
            $('#addAccountModal').modal('hide').find('form')[0].reset();
            loadAccounts();
        }).fail(err => alert(err.responseJSON.message));
    });

    $('#account-table-body').on('click', '.edit-btn', function () {
        $('#edit-account-id').val($(this).data('id'));
        $('#edit-email').val($(this).data('email'));
        $('#edit-role').val($(this).data('role'));
        $('#editAccountModal').modal('show');
    });

    $('#editAccountForm').submit(function (e) {
        e.preventDefault();
        $.post('/api/accounts/update', {
            id: $('#edit-account-id').val(),
            role: $('#edit-role').val()
        }, function () {
            $('#editAccountModal').modal('hide');
            loadAccounts();
        }).fail(err => alert(err.responseJSON.message));
    });

    // Show change password modal
    $('#account-table-body').on('click', '.change-password-btn', function () {
        const accountId = $(this).data('id');
        const accountEmail = $(this).data('email');
        $('#change-password-account-id').val(accountId);
        $('#change-password-email').text(accountEmail);
        $('#changePasswordModal').modal('show');
    });

    // Handle change password submission
    $('#changePasswordForm').submit(function (e) {
        e.preventDefault();
        const newPassword = $('#new-password').val();
        const confirmPassword = $('#confirm-password').val();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        $.post('/api/accounts/change-password', { id: $('#change-password-account-id').val(), password: newPassword }, function (response) {
            alert(response.message);
            $('#changePasswordModal').modal('hide').find('form')[0].reset();
        }).fail(err => alert(err.responseJSON.message));
    });

    $('#account-table-body').on('click', '.delete-btn', function () {
        if (confirm('Are you sure you want to delete this account?')) {
            $.post('/api/accounts/delete', { id: $(this).data('id') }, function () {
                loadAccounts();
            }).fail(err => alert(err.responseJSON.message));
        }
    });

    loadAccounts();
});