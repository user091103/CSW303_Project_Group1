$(document).ready(function () {
    let all_students = [];
    let all_classes_data = []; // Store full class data

    // Helper to format date for input fields
    const toInputDate = (dateString) => dateString ? dateString.split('T')[0] : '';

    // Show the "Add Student" form
    $(".add-student-button").click(function () {
        $('#addStudentModal').modal('show');
    });

    // Generic cancel button
    $(".cancel-action-btn").click(function () {
        $(this).closest('.card').hide(); // This is for the old card, can be removed if not used elsewhere
        $('#sidebar-cards > .card:not(.add):not(.change)').show();
    });


    // Load all classes into filter and forms
    function loadClassesIntoSelect() {
        $.get('/classdata', function (classes) {
            all_classes_data = classes; // Save class data globally

            const classFilter = $('#class-filter');
            const updateClassSelect = $('#update-class');
            const addClassSelect = $('.add-class-select');

            classFilter.find('option:not(:first)').remove();
            updateClassSelect.empty();
            addClassSelect.empty().append('<option value="">-- Select a Class --</option>');

            classes.forEach(cls => {
                addClassSelect.append(`<option value="${cls.class_code}">${cls.class_name} (${cls.class_code})</option>`);
                classFilter.append(`<option value="${cls.class_code}">${cls.class_name} (${cls.class_code})</option>`);
                updateClassSelect.append(`<option value="${cls.class_code}">${cls.class_name} (${cls.class_code})</option>`);
            });
        }, 'json');
    }

    // Auto-fill teacher name when a class is selected in the Add modal
    $('#addStudentModal').on('change', '.add-class-select', function () {
        const selectedClassCode = $(this).val();
        const teacherInput = $('#addStudentModal').find('input[name="teacher"]');

        if (selectedClassCode) {
            const selectedClass = all_classes_data.find(cls => cls.class_code === selectedClassCode);
            if (selectedClass && selectedClass.teacher) {
                teacherInput.val(selectedClass.teacher);
            } else {
                teacherInput.val(''); // Clear if class has no teacher
            }
        } else {
            teacherInput.val(''); // Clear if no class is selected
        }
    });
    // Initial data load
    loadPage();
    loadClassesIntoSelect();

    // Fetch all students for client-side searching/filtering
    function loadAllStudents() {
        $.get("/getallstudentdata", function (data) {
            all_students = data;
            loadPage(); // Reload the first page with all students
        }, 'json');
    }
    loadAllStudents();

    // Handle Delete
    $("tbody").on('click', '.delete', function () {
        let id = $(this).closest('tr').attr("class");
        $.post('/removestudent', { id: id }, function (data) {
            alert(data.message);
            loadAllStudents(); // Reload all data
        });
    })
    $("tbody").on('click', '.Delete', function () {
        updateTable();
    })

    // When a table row is clicked (but not the delete button)
    $("tbody").on('click', 'tr', function () {
        $('.detail2 .list-group').html('<li class="list-group-item">Loading...</li>');
        $('.detail2 .card-footer').hide();
        $('.detail2').fadeIn();

        const id = $(this).attr("class");
        let student;
        for (let i of all_students) {
            if (i.id == id) {
                student = i;
            }
        }
        let base = ` <li class="list-group-item"><b>IDENTITY:</b> ${student.id}</li>
                            <li class="list-group-item"><b>FULL NAME:</b> ${student.LastName} ${student.FirstName} </li>
                            <li class="list-group-item"><b>PHONE:</b> ${student.tel}</li>
                            <li class="list-group-item"><b>STUDY ON: </b>${student.dateStudy.slice(0, 10)}</li>
                            <li class="list-group-item"><b>CLASS: </b>${student.class}</li>
                            <li class="list-group-item"><b>TEACHER: </b>${student.teacher}</li>
                            `
        $('.detail2 .list-group').html(base); // Populate details
        $('.detail2 .card-footer').show(); // Show the footer with the Edit button

        // Populate and show the update form
        $('#update-id').val(student.id);
        $('#update-lastname').val(student.LastName);
        $('#update-firstname').val(student.FirstName);
        $('#update-tele').val(student.tel);
        $('#update-datestudy').val(toInputDate(student.dateStudy));
        $('#update-class').val(student.class);
        $('#update-teacher').val(student.teacher);
    });

    // Handle clicking the "Edit Student" button on the details card
    $('#edit-student-btn').on('click', function () {
        $('#editStudentModal').modal('show');
    });

    // Handle Search and Filter
    $(".search").click(function () {
        const searchTerm = $('#search-input').val().toLowerCase();
        const classFilter = $('#class-filter').val();

        const filteredStudents = all_students.filter(student => {
            const nameMatch = `${student.LastName} ${student.FirstName}`.toLowerCase().includes(searchTerm);
            const phoneMatch = student.tel && student.tel.includes(searchTerm);
            const classMatch = !classFilter || student.class === classFilter;

            return (nameMatch || phoneMatch) && classMatch;
        });

        // Since we don't have server-side pagination for filtered results,
        // we will display all filtered results at once.
        displayStudentsInTable(filteredStudents);
        $('#pagination').empty(); // Hide pagination for filtered results
    });

    // Reset search
    $('#reset-search-btn').click(function () {
        $('#search-input').val('');
        $('#class-filter').val('');
        loadPage(); // Reload paginated data
    });

    // Handle Update Form Submission
    $('#update-student-form').submit(function (e) {
        e.preventDefault();
        const studentData = {
            id: $('#update-id').val(),
            lastname: $('#update-lastname').val(),
            firstname: $('#update-firstname').val(),
            tele: $('#update-tele').val(),
            datestudy: $('#update-datestudy').val(),
            class: $('#update-class').val(),
            teacher: $('#update-teacher').val(),
        };

        // Assuming an endpoint /updateStudent exists
        $.post('/updateStudent', studentData, function (response) {
            alert(response.message || "Student updated successfully!");
            loadAllStudents();
            $('#editStudentModal').modal('hide'); // Hide modal on success
        }).fail(function () {
            alert("Failed to update student.");
        });
    });

    // This part listens for requests from the class-manager page to show students
    // It seems to have been removed, let's add it back in a more robust way.
    // Note: This approach is unconventional. A better long-term solution would be
    // to have a dedicated student list page or handle this within class-manager.html itself.
    // However, to fix the existing logic:
    const urlParams = new URLSearchParams(window.location.search);
    const classCodeToView = urlParams.get('view_class');

    if (classCodeToView) {
        // Wait for all students to be loaded
        const interval = setInterval(function () {
            if (all_students.length > 0) {
                clearInterval(interval);
                const filtered = all_students.filter(s => s.class === classCodeToView);
                displayStudentsInTable(filtered);
                // Optionally, update a title or breadcrumb
                const listHeader = $('.card-header h5');
                if (listHeader.length) {
                    listHeader.text(`Students in Class: ${classCodeToView}`);
                }
                $('#pagination').hide(); // Hide pagination for this filtered view
            }
        }, 100);
    }
})

function displayStudentsInTable(students) {
    $('tbody').empty();
    students.forEach(student => {
        $('tbody').append(`<tr class="${student.id}">
                            <td scope="col">${student.id}</td>
                            <td scope="col">${student.LastName}</td>
                            <td scope="col">${student.FirstName}</td>
                            <td scope="col">${student.tel}</td>
                            <td scope="col">${student.dateStudy.slice(0, 10)}</td>
                            <td scope="col">${student.class}</td>
                            <td><button class="btn btn-sm btn-danger delete">Delete</button></td>
                        </tr>`);
    });
}

const loadPage = (page = 1, limit = 10) => {
    $.get('/getData', { page, limit }, function (data) {
        displayStudentsInTable(data.students);

        $('#pagination').empty();

        if (data.totalPages > 1) {
            if (page > 1) {
                $('#pagination').append(`<li class="page-item"><a class="page-link" href="#" onclick="loadPage(${page - 1}, ${limit})">Previous</a></li>`);
            } else {
                $('#pagination').append('<li class="page-item disabled"><span class="page-link">Previous</span></li>');
            }

            for (let i = 1; i <= data.totalPages; i++) {
                $('#pagination').append(`<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" onclick="loadPage(${i}, ${limit})">${i}</a></li>`);
            }

            if (page < data.totalPages) {
                $('#pagination').append(`<li class="page-item"><a class="page-link" href="#" onclick="loadPage(${page + 1}, ${limit})">Next</a></li>`);
            } else {
                $('#pagination').append('<li class="page-item disabled"><span class="page-link">Next</span></li>');
            }
        }
    });
};