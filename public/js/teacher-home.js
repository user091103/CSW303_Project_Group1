// --- DUMMY DATA (for demonstration) ---
const classes = [
    { id: 101, name: 'TOEIC 550', studentCount: 3 },
    { id: 102, name: 'IELTS 6.5', studentCount: 1 }
];

const students = {
    101: [ // Students for class 101
        { id: 1, name: 'Nguyen Van A', studentId: '001' },
        { id: 3, name: 'Le Van C', studentId: '003' },
        { id: 4, name: 'Pham Thi D', studentId: '004' }
    ],
    102: [ // Students for class 102
        { id: 2, name: 'Tran Thi B', studentId: '002' }
    ]
};

// --- UI HELPER FUNCTIONS ---
function showPlaceholder(message) {
    const placeholderHtml = `
                <div class="text-center text-muted placeholder-content">
                    <i class="fa fa-hand-o-left fa-3x mb-3"></i>
                    <p>${message}</p>
                </div>`;
    $('#details-content').html(placeholderHtml);
}

function showClasses() {
    $('#left-panel-header').html('<i class="fa fa-university"></i> Your Classes');
    const list = $('#left-panel-list');
    list.empty();
    classes.forEach(cls => {
        list.append(`
                    <a href="#" class="list-group-item list-group-item-action class-item" data-class-id="${cls.id}">
                        <h6 class="mb-1">${cls.name}</h6>
                        <small>${cls.studentCount} students</small>
                    </a>`);
    });
    showPlaceholder("Please select a class from the list to view its students.");
}

function showStudents(classId, className) {
    const header = $('#left-panel-header');
    header.html(`
                <button id="back-to-classes" class="btn btn-sm btn-light mr-2"><i class="fa fa-arrow-left"></i></button>
                <i class="fa fa-users"></i> Students in ${className}
            `);

    const list = $('#left-panel-list');
    list.empty();
    const classStudents = students[classId] || [];
    classStudents.forEach(student => {
        list.append(`
                    <a href="#" class="list-group-item list-group-item-action student-item" data-student-id="${student.id}">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${student.name}</h6>
                            <small>ID: ${student.studentId}</small>
                        </div>
                    </a>`);
    });
    showPlaceholder("Please select a student to view and edit their grades.");
}

function showGradeDetails(studentId, studentName) {
    $.get(`/api/student/${studentId}/grades`, function (studentGrades) {
        let gradeRows = '';
        if (studentGrades.length > 0) {
            studentGrades.forEach(grade => {
                gradeRows += ` 
                            <tr data-grade-id="${grade.grade_id}">
                                <td>${grade.grade_name}</td>
                                <td>${grade.score}</td>
                                <td class="text-right">
                                    <button class="btn btn-sm btn-info edit-grade-btn">Edit</button>
                                    <button class="btn btn-sm btn-danger delete-grade-btn">Delete</button>
                                </td>
                            </tr>
                        `;
            });
        } else {
            gradeRows = '<tr><td colspan="3" class="text-center text-muted">No grades recorded for this student.</td></tr>';
        }

        const detailsHtml = `
                    <h4 class="mb-4">Grades for: <strong>${studentName}</strong></h4>
                    <table class="table table-bordered table-hover">
                        <thead class="thead-light"><tr><th>Grade Name</th><th>Score</th><th>Actions</th></tr></thead>
                        <tbody>${gradeRows}</tbody>
                    </table>
                    <hr>
                    <h5><i class="fa fa-plus-circle"></i> Add New Grade</h5>
                    <form id="add-grade-form">
                        <input type="hidden" name="student_id" value="${studentId}">
                        <div class="form-row">
                            <div class="col"><input type="text" name="grade_name" class="form-control" placeholder="e.g., Final Exam" required></div>
                            <div class="col"><input type="text" name="score" class="form-control" placeholder="Score" required></div>
                            <div class="col-auto"><button type="submit" class="btn btn-success">Add Grade</button></div>
                        </div>
                    </form>
                `;
        $('#details-content').html(detailsHtml);
    }).fail(function () {
        alert("Error: Could not fetch student grades.");
    });
}

// --- MAIN LOGIC ---
$(document).ready(function () {
    // Initial load
    showClasses();

    // Event Delegation for dynamic elements
    $('#left-panel').on('click', '.class-item', function (e) {
        e.preventDefault();
        const classId = $(this).data('class-id');
        const className = $(this).find('h6').text();
        showStudents(classId, className);
    });

    $('#left-panel').on('click', '#back-to-classes', function () {
        showClasses();
    });

    $('#left-panel').on('click', '.student-item', function (e) {
        e.preventDefault();
        $('#left-panel-list a').removeClass('active');
        $(this).addClass('active');

        const studentId = $(this).data('student-id');
        const studentName = $(this).find('h6').text();
        showGradeDetails(studentId, studentName);
    });

    // Handle ADD Grade
    $('#details-content').on('submit', '#add-grade-form', function (e) {
        e.preventDefault();
        const formData = $(this).serialize();
        const studentId = $('input[name="student_id"]').val();
        const studentName = $('#details-content h4 strong').text();

        $.post('/api/grades/add', formData, function (response) {
            alert("Success!");
            showGradeDetails(studentId, studentName); // Refresh the list
        }).fail(function () {
            alert("Error: Could not add grade.");
        });
    });

    // Handle Grade EDIT
    $('#details-content').on('click', '.edit-grade-btn', function () {
        const row = $(this).closest('tr');
        const gradeId = row.data('grade-id');
        const gradeName = row.find('td:eq(0)').text();
        const score = row.find('td:eq(1)').text();

        // Prevent editing multiple rows at once
        if ($('.save-grade-btn').length > 0) {
            alert("Please save or cancel the current edit first.");
            return;
        }

        // Replace row with editable form
        row.html(`
                    <td colspan="3">
                        <div class="form-inline">
                            <input type="text" class="form-control form-control-sm mr-2 flex-grow-1" value="${gradeName}">
                            <input type="text" class="form-control form-control-sm mr-2" value="${score}">
                            <button type="button" class="btn btn-sm btn-success mr-1 save-grade-btn">Save</button>
                            <button type="button" class="btn btn-sm btn-secondary cancel-edit-btn">Cancel</button>
                        </div>
                    </td>
                `);
    });

    // Handle Grade SAVE
    $('#details-content').on('click', '.save-grade-btn', function () {
        const row = $(this).closest('tr');
        const gradeId = row.data('grade-id'); // Get gradeId from the original row's data
        const newGradeName = row.find('input:eq(0)').val();
        const newScore = row.find('input:eq(1)').val();
        const studentId = $('input[name="student_id"]').val();
        const studentName = $('#details-content h4 strong').text();

        $.post('/api/grades/update', { grade_id: gradeId, grade_name: newGradeName, score: newScore }, function (response) {
            alert("Success!");
            showGradeDetails(studentId, studentName); // Refresh
        }).fail(function () {
            alert("Error: Could not update grade.");
        });
    });

    // Handle Grade CANCEL edit
    $('#details-content').on('click', '.cancel-edit-btn', function () {
        const studentId = $('input[name="student_id"]').val();
        const studentName = $('#details-content h4 strong').text();
        showGradeDetails(studentId, studentName); // Just re-render to cancel
    });

    // Handle Grade DELETE
    $('#details-content').on('click', '.delete-grade-btn', function () {
        if (!confirm("Are you sure you want to delete this grade?")) return;

        const gradeId = $(this).closest('tr').data('grade-id');
        const studentId = $('input[name="student_id"]').val();
        const studentName = $('#details-content h4 strong').text();

        $.post('/api/grades/delete', { grade_id: gradeId }, function (response) {
            alert("Success!");
            showGradeDetails(studentId, studentName); // Refresh
        }).fail(function () {
            alert("Error: Could not delete grade.");
        });
    });
});