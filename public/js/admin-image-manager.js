$(document).ready(function () {
    function loadImages() {
        $.get('/api/images', function (images) {
            const gallery = $('#image-gallery');
            gallery.empty();
            images.forEach(image => {
                gallery.append(`
                            <div class="col-md-4 col-lg-3 mb-4">
                                <div class="gallery-img-container">
                                    <img src="${image.url}" class="gallery-img">
                                    <button class="btn btn-danger btn-sm delete-img-btn" data-filename="${image.filename}">&times;</button>
                                </div>
                            </div>
                        `);
            });
        });
    }
    loadImages();

    // Handle image deletion
    $('#image-gallery').on('click', '.delete-img-btn', function () {
        const filename = $(this).data('filename');
        if (confirm(`Are you sure you want to delete this image?`)) {
            $.post('/api/images/delete', { filename: filename }, function (response) {
                alert(response.message);
                loadImages(); // Refresh the gallery
            }).fail(function () {
                alert('An error occurred while deleting the image.');
            });
        }
    });
});