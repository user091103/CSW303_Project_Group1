$(document).ready(function () {
    let all_teachers = [];

    function displayTeachers(teachers) {
        const container = $(".teacher-work");
        container.empty();
        if (teachers.length === 0) {
            container.html('<p class="col-12 text-center">No teachers found.</p>');
            return;
        }
        teachers.forEach(teacher => {
            const card = `
                        <div class="col-md-4 col-lg-3 mb-4" data-id="${teacher.id}">
                            <div class="card h-100 shadow-sm">
                                <div class="teacher-img-container">
                                    <img src="${teacher.img_path || 'imgs/user.png'}" class="card-img-top" alt="${teacher.full_name}">
                                </div>
                                <div class="card-body">
                                    <h5 class="card-title">${teacher.full_name}</h5>
                                    <p class="card-text mb-1" title="${teacher.email}"><b>Email:</b> ${teacher.email}</p>
                                    <p class="card-text mb-1"><b>Phone:</b> ${teacher.phone}</p>
                                    <p class="card-text mb-1"><b>Specialty:</b> ${teacher.specialty}</p>
                                    <p class="card-text mb-1"><b>Experience:</b> ${teacher.experience_years} years</p>
                                    <p class="card-text mb-1"><b>Qualification:</b> ${teacher.qualification}</p>
                                    <p class="card-text"><b>Availability:</b> ${teacher.availability}</p>
                                </div>
                                <div class="card-footer text-center">
                                    <button class="btn btn-sm btn-info edit-btn">Edit</button>
                                    <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
            container.append(card);
        });
    }

    function loadAllTeachers() {
        // IMPORTANT: Update this endpoint if your backend API changes from /staffdata to /teacherdata
        $.get("/teacherdata", function (data) {
            all_teachers = data;
            displayTeachers(all_teachers);
        }, "json");
    }

    loadAllTeachers();

    // Show Add Teacher Modal
    $('#add-teacher-btn').on('click', function () {
        $('#addTeacherModal').modal('show');
    });

    // Handle Search
    $('#search-name-field').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredTeachers = all_teachers.filter(t => t.full_name.toLowerCase().includes(searchTerm));
        displayTeachers(filteredTeachers);
    });

    $('#reset-search-btn').on('click', function () {
        $('#search-name-field').val('');
        displayTeachers(all_teachers);
    });

    // Handle Delete
    $('.teacher-work').on('click', '.delete-btn', function () {
        const id = $(this).closest('.col-md-4').data('id');
        if (confirm('Are you sure you want to delete this teacher?')) {
            // IMPORTANT: Update this endpoint if your backend API changes
            $.post("/deleteTeacher", { id: id }, function () {
                alert('Teacher deleted successfully.');
                loadAllTeachers();
            }).fail(function () {
                alert('Error deleting teacher.');
            });
        }
    });

    // Handle Show Edit Modal
    $('.teacher-work').on('click', '.edit-btn', function () {
        const id = $(this).closest('.col-md-4').data('id');
        const teacher = all_teachers.find(t => t.id == id);
        if (teacher) {
            $('#edit-id').val(teacher.id);
            $('#edit-full_name').val(teacher.full_name);
            $('#edit-phone').val(teacher.phone);
            $('#edit-email').val(teacher.email);
            $('#edit-qualification').val(teacher.qualification);
            $('#edit-specialty').val(teacher.specialty);
            $('#edit-experience_years').val(teacher.experience_years);
            $('#edit-availability').val(teacher.availability);
            $('#edit-current-image').attr('src', teacher.img_path || 'imgs/user.png');
            $('#editTeacherModal').modal('show');
        }
    });

    // Handle Edit Form Submission
    $('#edit-teacher-form').on('submit', function (e) {
        e.preventDefault();
        var formData = new FormData(this);

        $.ajax({
            url: '/updateTeacher',
            type: 'POST',
            data: formData,
            processData: false, // Important!
            contentType: false, // Important!
            success: function (response) {
                alert(response.message || 'Teacher updated successfully!');
                $('#editTeacherModal').modal('hide');
                loadAllTeachers();
            },
            error: function () { alert('Error updating teacher information.'); }
        });
    });
});