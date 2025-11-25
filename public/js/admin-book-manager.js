$(document).ready(function () {
    let all_books = [];

    function displayBooks(books) {
        const tbody = $('#book-table-body');
        tbody.empty();
        if (books.length === 0) {
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
                            </div>
                        </tr>`;
            tbody.append(row);
        });
    }

    function loadAllBooks() {
        $.get("/bookdata", function (data) {
            all_books = data;
            displayBooks(all_books);
        }, "json");
    }

    loadAllBooks();

    $('#add-book-btn').on('click', () => $('#addBookModal').modal('show'));

    $('#add-book-form').on('submit', function (e) {
        e.preventDefault();
        $.post('/addBook', $(this).serialize(), function (response) {
            alert(response.message);
            $('#addBookModal').modal('hide');
            $(e.target)[0].reset();
            loadAllBooks();
        }).fail(() => alert('Error adding book.'));
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
        $.post('/changeBook', $(this).serialize(), function (response) {
            alert(response.message);
            $('#editBookModal').modal('hide');
            loadAllBooks();
        }).fail(() => alert('Error updating book.'));
    });

    $('#book-table-body').on('click', '.delete-btn', function () {
        const id = $(this).closest('tr').data('id');
        if (confirm('Are you sure you want to delete this book?')) {
            $.post('/deleteBook', { id: id }, function (response) {
                alert(response.message);
                loadAllBooks();
            }).fail(() => alert('Error deleting book.'));
        }
    });

    $('#search-name-field').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredBooks = all_books.filter(b => b.name.toLowerCase().includes(searchTerm));
        displayBooks(filteredBooks);
    });

    $('#reset-search-btn').on('click', () => {
        $('#search-name-field').val('');
        displayBooks(all_books);
    });
});