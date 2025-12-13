$(document).ready(function () {
    let all_books = [];

    function displayBooks(books) {
        const tbody = $('#book-table-body');
        tbody.empty();
        if (!books || books.length === 0) {
            tbody.html('<tr><td colspan="6" class="text-center">No books found.</td></tr>');
            return;
        }
        books.forEach(book => {
            const row = `
                <tr data-id="${book.id}">
                    <td>${book.id}</td>
                    <td>${book.name}</td>
                    <td>${book.onhand}</td>
                    <td>${book.amount}</td>
                    <td>${book.price}</td>
                    <td>
                        <button class="btn btn-sm btn-info edit-btn">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                    </td>
                </tr>`;
            tbody.append(row);
        });
    }

    function loadAllBooks() {
        $.get("/bookdata", function (data) {
            all_books = data || [];
            displayBooks(all_books);
        }, "json").fail(function () {
            console.error('Failed to load book data');
        });
    }

    loadAllBooks();

    $('#add-book-btn').on('click', () => $('#addBookModal').modal('show'));

    $('#add-book-form').on('submit', function (e) {
        e.preventDefault();
        const $form = $(this);
        const formData = $form.serialize();

        $.post('/addBook', formData, function (response) {
            alert(response.message || 'Added');
            $('#addBookModal').modal('hide');

            // Reset form safely
            $('#add-book-form')[0].reset();

            // If the backend returns the created book, push it; otherwise reload
            if (response && response.book) {
                all_books.push(response.book);
                displayBooks(all_books);
            } else {
                // Fallback: reload list from server
                loadAllBooks();
            }
        }).fail(function () {
            alert('Error adding book.');
        });
    });

    $('#book-table-body').on('click', '.edit-btn', function () {
        const id = $(this).closest('tr').data('id');
        const book = all_books.find(b => b.id == id);
        if (book) {
            $('#edit-id').val(book.id);
            $('#edit-name').val(book.name);
            $('#edit-onhand').val(book.onhand);
            $('#edit-amount').val(book.amount);
            $('#edit-price').val(book.price);
            $('#editBookModal').modal('show');
        }
    });

    $('#edit-book-form').on('submit', function (e) {
        e.preventDefault();
        const $form = $(this);
        $.post('/changeBook', $form.serialize(), function (response) {
            alert(response.message || 'Updated');
            $('#editBookModal').modal('hide');
            // refresh list
            loadAllBooks();
        }).fail(function () {
            alert('Error updating book.');
        });
    });

    $('#book-table-body').on('click', '.delete-btn', function () {
        const $row = $(this).closest('tr');
        const id = $row.data('id');
        if (!confirm('Are you sure you want to delete this book?')) return;

        $.post('/deleteBook', { id: id }, function (response) {
            alert(response.message || 'Deleted');
            if (response && response.success) {
                // remove from local array and UI
                all_books = all_books.filter(b => b.id != id);
                $row.fadeOut(180, function () { $(this).remove(); });
            } else {
                // fallback: reload list
                loadAllBooks();
            }
        }).fail(function () {
            alert('Error deleting book.');
        });
    });

    $('#search-name-field').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredBooks = all_books.filter(b => b.name && b.name.toLowerCase().includes(searchTerm));
        displayBooks(filteredBooks);
    });

    $('#reset-search-btn').on('click', () => {
        $('#search-name-field').val('');
        displayBooks(all_books);
    });
});
