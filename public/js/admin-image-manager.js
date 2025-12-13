$(document).ready(function () {

    // Load images
    function loadImages() {
        $.ajax({
            url: '/api/images',
            method: 'GET',
            success: function (images) {
                const gallery = $('#image-gallery');
                gallery.empty();

                if (!Array.isArray(images) || images.length === 0) {
                    gallery.append(`<p class="text-center text-muted">No images found.</p>`);
                    return;
                }

                images.forEach(image => {
                    gallery.append(`
                        <div class="col-md-4 col-lg-3 mb-4">
                            <div class="gallery-img-container position-relative">
                                <img src="${image.url}" class="gallery-img">
                                <button class="btn btn-danger btn-sm delete-img-btn position-absolute top-0 end-0 m-1"
                                    data-filename="${image.filename}">
                                    &times;
                                </button>
                            </div>
                        </div>
                    `);
                });
            },
            error: function () {
                alert('Failed to load images.');
            }
        });
    }

    loadImages();


    // Delete image
    $('#image-gallery').on('click', '.delete-img-btn', function () {
        const filename = $(this).data('filename');

        if (!filename) {
            alert("Invalid filename.");
            return;
        }

        if (confirm(`Are you sure you want to delete this image?`)) {

            $.ajax({
                url: '/api/images/delete',
                method: 'POST',
                data: { filename: filename },
                success: function (response) {
                    alert(response.message || "Deleted successfully.");
                    loadImages(); // refresh gallery
                },
                error: function () {
                    alert('Error deleting the image.');
                }
            });

        }
    });

});
