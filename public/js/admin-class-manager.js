// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}
$(document).ready(function () {
    let all_classes = [];

    // Function to load teachers into select dropdowns
    function loadTeachers() {
        // Fetch teacher data from the correct endpoint
        $.get('/teacherdata', function (teachers) {
            const teacherSelects = $('.teacher-select');
            teacherSelects.each(function () {
                const currentVal = $(this).val(); // Preserve selected value if any
                $(this).find('option:not(:first)').remove(); // Clear existing options
                teachers.forEach(teacher => {
                    // Use 'full_name' as it matches the database schema
                    $(this).append(`<option value="${teacher.full_name}">${teacher.full_name}</option>`);
                });
                $(this).val(currentVal);
            });
        }, 'json');
    }

    function displayClasses(classes) {
        $('#class-container').empty();
        if (classes.length === 0) {
            $('#class-container').html('<p class="col-12 text-center">No classes found.</p>');
            return;
        }
        classes.forEach(cls => {
            const classBlock = `
                        <div class="col-md-12 mb-4" data-id="${cls.id}">
                            <div class="card h-100">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">${cls.class_name} (${cls.class_code})</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-sm-6">
                                            <p class="card-text mb-1"><b>Course:</b> ${cls.course || 'N/A'} - <b>Level:</b> ${cls.level || 'N/A'}</p>
                                            <p class="card-text mb-1"><b>Schedule:</b> ${cls.schedule || 'N/A'}</p>
                                            <p class="card-text mb-1"><b>Teacher:</b> ${cls.teacher || 'N/A'} - <b>Room:</b> ${cls.room || 'N/A'}</p>
                                            <p class="card-text mb-1"><b>Duration:</b> ${formatDate(cls.start_date)} - ${formatDate(cls.end_date)}</p>
                                        </div>
                                        <div class="col-sm-6">
                                            <p class="card-text mb-1"><b>Status:</b> <span class="badge badge-info">${cls.status || 'N/A'}</span></p>
                                            <p class="card-text mb-1"><b>Progress:</b> ${cls.sessions_done || 0} / ${cls.total_sessions || 'N/A'} sessions</p>
                                            <p class="card-text mb-1"><b>Students:</b> ${cls.student_count || 0}</p>
                                            <p class="card-text mb-1"><b>Fee:</b> ${cls.tuition_fee || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer text-right">
                                    <button class="btn btn-sm btn-info update-btn">Update</button>
                                    <button class="btn btn-sm btn-success view-students-btn" data-class-code="${cls.class_code}" data-class-name="${cls.class_name}">View Students</button>
                                    <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
            $('#class-container').append(classBlock);
        });
    }

    // Student List Modal
    $('body').append(`
                <div class="modal fade" id="studentListModal" tabindex="-1" aria-labelledby="studentListModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="studentListModalLabel">Students in Class: <span></span></h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            </div>
                            <div class="modal-body"><table class="table table-striped"><thead><tr><th>ID</th><th>Full Name</th><th>Telephone</th><th>Enrollment Date</th></tr></thead><tbody id="student-list-tbody"></tbody></table></div>
                            <div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div>
                        </div>
                    </div>
                </div>
            `);

    function loadAllClasses() {
        $.get('/classdata', function (data) {
            all_classes = data;
            displayClasses(all_classes);
        }, 'json');
    }

    loadAllClasses();
    loadTeachers(); // Load teachers on page load

    // Handle Search
    $('#search-btn').on('click', function () {
        const searchId = $('#search-id-input').val().trim();
        if (searchId === '') {
            displayClasses(all_classes);
            return;
        }
        const filteredClasses = all_classes.filter(cls => cls.id.toString() === searchId);
        displayClasses(filteredClasses);
    });

    // Handle Reset Search
    $('#reset-btn').on('click', function () {
        $('#search-id-input').val('');
        displayClasses(all_classes);
    });

    // Handle Delete
    $('#class-container').on('click', '.delete-btn', function () {
        const id = $(this).closest('.col-md-12').data('id');
        if (confirm('Are you sure you want to delete this class?')) {
            $.post('/deleteClass', { id: id }, function (response) {
                alert(response.message);
                loadAllClasses();
            });
        }
    });

    // Handle showing student list modal
    $('#class-container').on('click', '.view-students-btn', function () {
        // This will redirect to the student management page with a filter
        const classCode = $(this).data('class-code');
        window.location.href = `admin-student-manager.html?view_class=${classCode}`;
    });

    // Handle showing update form
    $('#class-container').on('click', '.update-btn', function () {
        const id = $(this).closest('.col-md-12').data('id');
        const classToUpdate = all_classes.find(c => c.id == id);
        if (classToUpdate) {
            // Helper to format date for input type="date"
            const toInputDate = (dateString) => dateString ? dateString.split('T')[0] : '';

            $('#update-class-id').val(classToUpdate.id);
            $('#update-class_name').val(classToUpdate.class_name);
            $('#update-class_code').val(classToUpdate.class_code);
            $('#update-course').val(classToUpdate.course);
            $('#update-level').val(classToUpdate.level);
            $('#update-start_date').val(toInputDate(classToUpdate.start_date));
            $('#update-end_date').val(toInputDate(classToUpdate.end_date));
            $('#update-schedule').val(classToUpdate.schedule);
            $('#update-total_sessions').val(classToUpdate.total_sessions);
            $('#update-sessions_done').val(classToUpdate.sessions_done);
            $('#update-teacher').val(classToUpdate.teacher);
            $('#update-room').val(classToUpdate.room);
            $('#update-status').val(classToUpdate.status);
            $('#update-tuition_fee').val(classToUpdate.tuition_fee);
            $('html, body').animate({
                scrollTop: $(".update-class-form").offset().top
            }, 500);

            $('.add-class-form').hide();
            $('.update-class-form').fadeIn();
        }
    });

    // Handle cancel update
    $('#cancel-update').on('click', function () {
        $('.update-class-form').hide();
        $('.add-class-form').fadeIn();
    });

    // Handle update submission
    $('#update-form').on('submit', function (e) {
        e.preventDefault();
        const classData = {
            id: $('#update-class-id').val(), class_name: $('#update-class_name').val(),
            class_code: $('#update-class_code').val(), course: $('#update-course').val(),
            level: $('#update-level').val(), start_date: $('#update-start_date').val(),
            end_date: $('#update-end_date').val(), schedule: $('#update-schedule').val(),
            total_sessions: $('#update-total_sessions').val(), sessions_done: $('#update-sessions_done').val(),
            teacher: $('#update-teacher').val(), room: $('#update-room').val(), status: $('#update-status').val(),
            tuition_fee: $('#update-tuition_fee').val(),
        };
        $.post('/updateClass', classData, function (response) {
            alert(response.message);
            loadAllClasses();
            $('#cancel-update').click(); // Hide form and show add form
        }).fail(function () {
            alert('An error occurred while updating the class.');
        });
    });
});