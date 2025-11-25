$(document).ready(function () {
    let all_teachers = [];

    function displayTeachers(teachers) {
        const container = $(".user-teacher");
        container.empty();
        if (teachers.length === 0) {
            container.html('<p class="col-12 text-center">No teachers found.</p>');
            return;
        }
        teachers.forEach(teacher => {
            const card = `
                        <div class="col-md-6 mb-4">
                            <div class="card h-100 shadow-sm">
                                <div class="row no-gutters">
                                    <div class="col-md-4">
                                        <div class="teacher-img-container">
                                            <img src="${teacher.img_path || 'imgs/user.png'}" class="card-img-top" alt="${teacher.full_name}">
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body">
                                            <h5 class="card-title">${teacher.full_name}</h5>
                                            <p class="card-text mb-1"><b>Specialty:</b> ${teacher.specialty}</p>
                                            <p class="card-text mb-1"><b>Qualification:</b> ${teacher.qualification}</p>
                                            <p class="card-text mb-1"><b>Experience:</b> ${teacher.experience_years} years</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            container.append(card);
        });
    }

    function loadAllTeachers() {
        $.get("/teacherdata", function (data) {
            all_teachers = data;
            displayTeachers(all_teachers);
        }, "json");
    }

    loadAllTeachers();
    loadGalleryImages();

    $("#searching").click(function () {
        const searchTerm = $("#search-name-field").val().toLowerCase();
        if (searchTerm === '') {
            displayTeachers(all_teachers);
            return;
        }
        const filteredTeachers = all_teachers.filter(teacher =>
            teacher.full_name.toLowerCase().includes(searchTerm)
        );
        displayTeachers(filteredTeachers);
    });
});

// Load courses dynamically
function loadCourses() {
    $.get('/classdata', function (classes) {
        const container = $('#course-list-container');
        container.empty();
        if (classes.length === 0) {
            container.html('<p class="col-12 text-center">No courses available at the moment.</p>');
            return;
        }

        classes.forEach(cls => {
            const courseCard = `
                        <div class="col-lg-4 col-md-6 mb-4">
                          <div class="card h-100 shadow-lg border-0">
                            <div class="card-body d-flex flex-column">
                              <h4 class="card-title text-danger">🎯 ${cls.class_name}</h4>
                              <p class="card-text">
                                Course: ${cls.course || 'N/A'}
                              </p>
                              <ul class="list-unstyled mb-3">
                                <li><b>Level:</b> ${cls.level || 'N/A'}</li>
                                <li><b>Teacher:</b> ${cls.teacher || 'N/A'}</li>
                                <li><b>Schedule:</b> ${cls.schedule || 'N/A'}</li>
                              </ul>
                              <button class="btn btn-danger w-100 mt-auto view-detail"
                                data-toggle="modal"
                                data-target="#courseModal"
                                data-class-id="${cls.id}">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                    `;
            container.append(courseCard);
        });

        // Attach click event for the new buttons
        $('.view-detail').on('click', function () {
            const classId = $(this).data('class-id');
            const selectedClass = classes.find(c => c.id == classId);

            if (selectedClass) {
                const modalBody = `
                            <p><strong>Course:</strong> ${selectedClass.course || 'N/A'}</p>
                            <p><strong>Level:</strong> ${selectedClass.level || 'N/A'}</p>
                            <p><strong>Schedule:</strong> ${selectedClass.schedule || 'N/A'}</p>
                            <p><strong>Teacher:</strong> ${selectedClass.teacher || 'N/A'}</p>
                            <p><strong>Fee:</strong> ${selectedClass.tuition_fee || 'N/A'}</p>
                        `;
                $('#courseModalLabel').text(selectedClass.class_name);
                $('#courseModalBody').html(modalBody);
            }
        });
    }, 'json');
}

loadCourses();

function loadGalleryImages() {
    $.get('/api/images', function (images) {
        const container = $('#image-gallery-container');
        container.empty();
        if (images.length === 0) {
            container.html('<p class="col-12 text-center">No images in the gallery yet.</p>');
            return;
        }
        images.forEach(image => {
            container.append(`
                        <div class="col-md-4 col-lg-3 mb-4 gallery-item">
                            <a href="${image.url}" data-toggle="lightbox" data-gallery="apix-gallery">
                                <img src="${image.url}" class="img-fluid">
                            </a>
                        </div>
                    `);
        });
    });
}