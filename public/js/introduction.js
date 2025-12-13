$(document).ready(function () {
    let all_teachers = [];
    let currentIndex = 0;
    const carousel = $("#teacher-carousel");

    function renderCarousel(teachers) {
        carousel.empty();
        if (!teachers || teachers.length === 0) {
            carousel.html('<p class="text-center w-100">No teachers found.</p>');
            return;
        }

        teachers.forEach(t => {
            const img = t.img_path || 'imgs/user.png';
            const name = t.full_name || '';
            const specialty = t.specialty || 'N/A';
            const qual = t.qualification || 'N/A';
            const exp = t.experience_years || 0;

            const $slide = $(`
                                <div class="flip-slide" data-index="" tabindex="0">
                                    <img src="${img}" alt="${name}">
                                    <div class="teacher-info-overlay">
                                        <h5 style="margin:0 0 6px;">${name}</h5>
                                        <div>Specialty: ${specialty}</div>
                                        <div>Qualification: ${qual}</div>
                                        <div>Experience: ${exp} years</div>
                                    </div>
                                </div>
                            `);
            carousel.append($slide);
        });

        if (currentIndex >= teachers.length) currentIndex = 0;

        layoutSlides();
        updateCarousel();
        attachSlideHandlers();
    }

    function computeOffset() {
        const $first = carousel.find('.flip-slide img').first();
        if ($first.length === 0) return 320;
        const w = $first.outerWidth(true);
        const gap = 48;
        return Math.round(w + gap);
    }

    function layoutSlides() {
        const slides = carousel.children('.flip-slide');
        const n = slides.length;
        if (n === 0) return;
        const offset = computeOffset();

        slides.each(function (i) {
            let d = i - currentIndex;
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;

            let x = d * offset;
            let scale = 1 - Math.min(Math.abs(d) * 0.12, 0.4);
            if (Math.abs(d) > 2) {
                x = d * offset * 1.1;
                scale = 0.72;
            }
            $(this).css('--x', x + 'px');
            $(this).css('--s', scale);
        });
    }

    function updateCarousel() {
        const slides = carousel.children('.flip-slide');
        const n = slides.length;
        if (n === 0) return;

        slides.removeClass('active side off');

        const prev = (currentIndex - 1 + n) % n;
        const next = (currentIndex + 1) % n;

        slides.eq(currentIndex).addClass('active');
        slides.eq(prev).addClass('side');
        slides.eq(next).addClass('side');

        // far slides
        slides.each(function (i) {
            const d = Math.abs(i - currentIndex);
            const wrapD = Math.abs((i - currentIndex + n) % n);
            const mind = Math.min(d, wrapD);
            if (mind > 2) $(this).addClass('off');
        });
    }

    function nextSlide() {
        const slides = carousel.children('.flip-slide');
        if (slides.length === 0) return;
        currentIndex = (currentIndex + 1) % slides.length;
        layoutSlides();
        updateCarousel();
    }
    function prevSlide() {
        const slides = carousel.children('.flip-slide');
        if (slides.length === 0) return;
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        layoutSlides();
        updateCarousel();
    }

    let autoplay = setInterval(nextSlide, 3000);
    carousel.on('mouseenter', () => clearInterval(autoplay));
    carousel.on('mouseleave', () => { autoplay = setInterval(nextSlide, 3000); });

    function attachSlideHandlers() {
        carousel.find('.flip-slide').off('click').on('click', function (e) {
            const idx = $(this).index();
            if ($(this).hasClass('active')) {
                $(this).toggleClass('show-info');
            } else {
                currentIndex = idx;
                layoutSlides();
                updateCarousel();
            }
        });

        $(document).off('keydown.carousel').on('keydown.carousel', function (e) {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });

        $(window).off('resize.carousel').on('resize.carousel', function () {
            layoutSlides();
        });
    }

    function loadAllTeachers() {
        $.get("/teacherdata", function (data) {
            all_teachers = Array.isArray(data) ? data : [];
            renderCarousel(all_teachers);
        }, "json").fail(function () {
            all_teachers = [];
            renderCarousel([]);
        });
    }


    $("#searching").on('click', function () {
        const term = $("#search-name-field").val().toLowerCase().trim();
        if (!term) {
            renderCarousel(all_teachers);
            return;
        }
        const filtered = all_teachers.filter(t => (t.full_name || '').toLowerCase().includes(term));
        currentIndex = 0;
        renderCarousel(filtered);
    });

    loadAllTeachers();
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
                          <div class="card h-100 shadow-lg border-0 card-hover">
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
    const container = $('#image-gallery-container');
    container.empty();

    $.get('/api/images', function (images) {
        if (!images || images.length === 0) {
            container.html('<p class="col-12 text-center">No images in the gallery yet.</p>');
            return;
        }

        images.forEach(img => {
            container.append(`
        <div class="col-md-4 col-lg-3 mb-4 gallery-item">
            <a href="${img.url}" target="_blank" data-toggle="lightbox" data-gallery="apix-gallery">
                <img src="${img.url}" class="img-fluid" alt="">
            </a>
        </div>
    `);
        });
    });
}

$(document).ready(function () {
    loadGalleryImages();
});
