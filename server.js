const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Khanhuh!@#09112003",
    database: "csw303",
    insecureAuth: true
});

const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/gallery';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});


const app = express();
app.use(cookieParser());
const upload = multer({ storage: storage });
const uploadGallery = multer({ storage: galleryStorage });
app.use(express.static('uploads'));
app.use(session({
    secret: '123456',  // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    // Session cookie expires in 1 minute (adjust as needed)
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

function isTeacher(req, res, next) {
    if (req.session.user && req.session.user.role === 'teacher') {
        return next();
    }
    res.redirect('/login'); // Redirect if not a teacher
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Access Denied: You do not have permission to view this page.');
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.get('/admin-home', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/admin-home.html');
});
app.get('/admin-student-manager.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/admin-student-manager.html');
})
app.get('/admin-teacher-manager.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/admin-teacher-manager.html');
})
app.get('/admin-book-manager.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/admin-book-manager.html');
})
app.get('/admin-class-manager.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/admin-class-manager.html');
})
app.get('/admin-account-manager.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/admin-account-manager.html');
})
app.get('/admin-image-manager.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/admin-image-manager.html');
})
app.get('/teacher-home.html', isAuthenticated, isTeacher, (req, res) => {
    res.sendFile(__dirname + '/views/teacher-home.html');
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/introduction.html'));
});
app.get('/logout', (req, res) => {
    res.clearCookie('user');
    req.session.destroy(() => {
        res.redirect('/login');
    });
})

app.get('/api/teacher/classes', isAuthenticated, isTeacher, (req, res) => {
    const teacherName = req.session.user.name; // Get the teacher's name from the session
    const sql = 'SELECT * FROM classes WHERE teacher = ?';
    con.query(sql, [teacherName], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error fetching classes.' });
        }
        res.json(results);
    });
});

app.get('/api/teacher/class/:class_code/students', isAuthenticated, isTeacher, (req, res) => {
    const { class_code } = req.params;
    const sql = 'SELECT id, LastName, FirstName, tel, dateStudy FROM students WHERE class = ?';
    con.query(sql, [class_code], (err, results) => {
        if (err) { return res.status(500).json({ message: 'Database error fetching students.' }); }
        res.json(results);
    });
});

app.post('/api/grades/update', isAuthenticated, isTeacher, (req, res) => {
    const { grade_id, grade_name, score } = req.body;
    const sql = 'UPDATE grades SET grade_name = ?, score = ? WHERE grade_id = ?';
    con.query(sql, [grade_name, score, grade_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error updating grade.' });
        }
        res.json({ message: 'Grade updated successfully!' });
    });
});

app.get('/api/student/:id/grades', isAuthenticated, isTeacher, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM grades WHERE student_id = ? ORDER BY date_added DESC';
    con.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error fetching grades.' });
        }
        res.json(results);
    });
});

app.post('/api/grades/add', isAuthenticated, isTeacher, (req, res) => {
    const { student_id, grade_name, score } = req.body;
    const sql = 'INSERT INTO grades (student_id, grade_name, score) VALUES (?, ?, ?)';
    con.query(sql, [student_id, grade_name, score], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error adding grade.' });
        }
        res.json({ message: 'Grade added successfully!', newGradeId: result.insertId });
    });
});

app.post('/api/grades/delete', isAuthenticated, isTeacher, (req, res) => {
    const { grade_id } = req.body;
    const sql = 'DELETE FROM grades WHERE grade_id = ?';
    con.query(sql, [grade_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error deleting grade.' });
        }
        res.json({ message: 'Grade deleted successfully!' });
    });
});

// Class Management Routes
app.get('/classdata', (req, res) => {
    con.query('SELECT * FROM classes', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error.');
        }
        res.json(results);
    });
});

app.post('/addClass', (req, res) => {
    const { class_name, class_code, course, level, start_date, end_date, schedule, total_sessions, sessions_done, teacher, room, status, student_count, tuition_fee } = req.body;
    const sql = 'INSERT INTO classes (class_name, class_code, course, level, start_date, end_date, schedule, total_sessions, sessions_done, teacher, room, status, student_count, tuition_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [class_name, class_code, course, level, start_date || null, end_date || null, schedule, total_sessions, sessions_done, teacher, room, status, student_count, tuition_fee];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        res.redirect('/class-manager.html');
    });
});

app.post('/updateClass', (req, res) => {
    const { id, class_name, class_code, course, level, start_date, end_date, schedule, total_sessions, sessions_done, teacher, room, status, student_count, tuition_fee } = req.body;
    const sql = 'UPDATE classes SET class_name = ?, class_code = ?, course = ?, level = ?, start_date = ?, end_date = ?, schedule = ?, total_sessions = ?, sessions_done = ?, teacher = ?, room = ?, status = ?, student_count = ?, tuition_fee = ? WHERE id = ?';
    const values = [class_name, class_code, course, level, start_date || null, end_date || null, schedule, total_sessions, sessions_done, teacher, room, status, student_count, tuition_fee, id];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error updating class' });
        }
        res.json({ message: 'Class updated successfully!' });
    });
});

app.post('/deleteClass', (req, res) => {
    const { id } = req.body;
    const sql = 'DELETE FROM classes WHERE id = ?';
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error deleting class' });
        }
        res.json({ message: 'Class deleted successfully!' });
    });
});


app.get('/getallstudentdata', (req, res) => {
    con.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error.');
        }
        res.json(results);
    });
});

app.get('/getData', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const offset = (page - 1) * limit;
    con.query('SELECT COUNT(*) AS count FROM students', (err, results) => {
        if (err) throw err;
        const totalItems = results[0].count;
        const totalPages = Math.ceil(totalItems / limit);
        con.query('SELECT * FROM students LIMIT ? OFFSET ?', [limit, offset], (err, students) => {
            if (err) throw err;
            res.json({
                page,
                limit,
                totalPages,
                totalItems,
                students
            });
        });
    });
});
app.get('/getDatasort', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const offset = (page - 1) * limit;
    con.query('SELECT COUNT(*) AS count FROM students', (err, results) => {
        if (err) throw err;
        const totalItems = results[0].count;
        const totalPages = Math.ceil(totalItems / limit);
        con.query(`SELECT * FROM students order by grade desc  LIMIT ${limit} OFFSET ${offset}`, (err, students) => {
            if (err) throw err;
            res.json({
                page,
                limit,
                totalPages,
                totalItems,
                students
            });
        });
    });
});


app.post('/removestudent', (req, res) => {
    const id = req.body.id;
    const query = `DELETE FROM students WHERE id = ?;`; // replace with your database name
    con.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting database:', err);
            return res.status(500).send({ message: 'Error deleting the database', error: err });
        }

    });
});

app.post('/addStudent', (req, res) => {

    let fisrtName = req.body.lastname
    let lastName = req.body.firstname
    let tele = req.body.tele
    let date = req.body.datestudy
    let classname = req.body.class
    let teacher = req.body.teacher
    let grade = req.body.grade

    const query = 'INSERT INTO Students (LastName, FirstName, tel, dateStudy, class, teacher, grade) VALUEs (?,?,?,?,?,?,?) ';
    con.query(query, [lastName, fisrtName, tele, date, classname, teacher, grade], (err, result) => {
        if (err) throw err;
        console.log('User registered:', result.insertId);
        res.redirect('/admin-student-manager.html');
    });
})
app.post('/Updategrade', (req, res) => {
    let ID = req.body.ID;
    let grade = req.body.grade
    const query = 'update Students set grade=?  WHERE id = ?';
    con.query(query, [grade, ID], (err, result) => {
        if (err) throw err;
        console.log('User registered:', result.insertId);
        res.redirect('/admin-student-manager.html');
    });
})



// stafff form

app.post('/addStaff', upload.single('image'), (req, res) => {
    const { full_name, phone, email, qualification, specialty, experience_years, availability, default_image_path } = req.body;
    let imgPathUrl;

    if (req.file) {
        // Case 1: User uploaded a file
        const { path: imgPath } = req.file;
        imgPathUrl = `/${path.basename(imgPath)}`; // The path should be relative to the 'uploads' static folder
    } else {
        // Case 2: No file was uploaded, use the default path from the hidden input
        imgPathUrl = default_image_path;
    }

    // IMPORTANT: The table name and columns must match your database schema.
    const sql = 'INSERT INTO teachers (full_name, phone, email, qualification, specialty, experience_years, availability, img_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    con.query(sql, [full_name, phone, email, qualification, specialty, experience_years, availability, imgPathUrl], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Log detailed error
            if (req.file) { fs.unlink(req.file.path, () => { }); } // Delete uploaded file if DB save fails
            return res.status(500).send('Database error.');
        }
        res.redirect('/admin-teacher-manager.html')
    });
})

app.post('/updateTeacher', upload.single('image'), (req, res) => {
    const { id, full_name, phone, email, qualification, specialty, experience_years, availability } = req.body;
    let sql;
    let values;

    if (req.file) {
        // Case 1: A new image is uploaded
        // Ensure the path uses forward slashes for URL compatibility
        const filename = path.basename(req.file.path);
        const imgPathUrl = `/uploads/${filename}`;
        sql = 'UPDATE teachers SET full_name = ?, phone = ?, email = ?, qualification = ?, specialty = ?, experience_years = ?, availability = ?, img_path = ? WHERE teacher_id = ?';
        values = [full_name, phone, email, qualification, specialty, experience_years, availability, imgPathUrl, id];
    } else {
        // Case 2: No new image is uploaded, update text fields only
        sql = 'UPDATE teachers SET full_name = ?, phone = ?, email = ?, qualification = ?, specialty = ?, experience_years = ?, availability = ? WHERE teacher_id = ?';
        values = [full_name, phone, email, qualification, specialty, experience_years, availability, id];
    }

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error updating teacher' });
        }
        res.json({ message: 'Teacher updated successfully!' });
    });
});

app.post('/deleteTeacher', (req, res) => {
    const id = req.body.id;
    const sql = 'DELETE FROM teachers WHERE teacher_id = ?';
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error deleting teacher' });
        }
        res.json({ message: 'Teacher deleted successfully!' });
    });
});


app.get('/teacherdata', (req, res) => {
    con.query('SELECT *, teacher_id as id FROM teachers', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error.');
        }
        res.json(results);
    });
});



app.get('/bookdata', (req, res) => {
    con.query('SELECT * FROM book', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error.');
        }
        res.json(results);
    });
});
app.post('/addBook', (req, res) => {
    const { name, onhand, amount, price } = req.body;
    const sql = 'INSERT INTO book (name, onhand, amount, price) VALUES (?, ?, ?, ?)';
    con.query(sql, [name, onhand, amount, price], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Log detailed error
            return res.status(500).json({ message: 'Error adding book.' });
        }
        res.json({ message: 'Book added successfully!' });
    });
});

app.post('/changeBook', (req, res) => {
    const { id, name, onhand, amount, price } = req.body;
    const sql = 'UPDATE book SET name = ?, onhand = ?, amount = ?, price = ? WHERE id = ?';
    con.query(sql, [name, onhand, amount, price, id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error updating book.' });
        }
        res.json({ message: 'Book updated successfully!' });
    });
});

app.post('/deleteBook', (req, res) => {
    const { id } = req.body;
    const sql = 'DELETE FROM book WHERE id = ?';
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error deleting book.' });
        }
        res.json({ message: 'Book deleted successfully!' });
    });
});


app.post('/userlogin', (req, res) => {

    const { email, password } = req.body;
    // db.exec(`INSERT INTO logs VALUES ("Login attempt from ${username}")`)

    const query = 'SELECT * FROM accounts WHERE email = ?';
    con.query(query, [email], (err, accounts) => {
        if (err) {
            console.error(err)
            res.redirect('/login')
            return
        }
        if (accounts.length === 0) {
            res.redirect('/login')
            return
        }
        // nextSessionId += 1
        const userRecord = accounts[0];

        // Compare the provided password with the stored hashed password

        bcrypt.compare(password, userRecord.passwords, (err, isMatch) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error!');
                return;
            }

            if (isMatch) {
                // Get teacher's full name to store in session
                con.query('SELECT full_name FROM teachers WHERE email = ?', [email], (err, teacherResult) => {
                    const teacherName = (teacherResult.length > 0) ? teacherResult[0].full_name : null;

                    // Store user info in session
                    req.session.user = { email: email, role: userRecord.role, name: teacherName };
                    res.cookie('user', email, { maxAge: 600000 });

                    // Redirect based on role
                    if (userRecord.role === 'teacher') {
                        return res.redirect('/teacher-home.html');
                    }
                    // Default to admin dashboard
                    return res.redirect('/admin-home');
                });

            } else {
                // Passwords don't match
                res.send('fail!');
            }
        });
    })

})

// Image Gallery APIs
app.post('/api/images/upload', isAuthenticated, isAdmin, uploadGallery.single('gallery_image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.redirect('/admin-image-manager.html');
});

app.get('/api/images', (req, res) => {
    const galleryDir = path.join(__dirname, 'uploads/gallery');
    fs.readdir(galleryDir, (err, files) => {
        if (err) {
            // If the directory doesn't exist, return an empty array
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            return res.status(500).json({ message: 'Unable to scan directory.' });
        }
        const images = files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .map(file => ({
                filename: file,
                url: `/uploads/gallery/${file}`
            }))
            .sort((a, b) => b.filename.localeCompare(a.filename)); // Sort by newest first
        res.json(images);
    });
});

app.post('/api/images/delete', isAuthenticated, isAdmin, (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ message: 'Filename is required.' });
    }

    const filePath = path.join(__dirname, 'uploads/gallery', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            // It's possible the file was already deleted, so we can be lenient
            // or check err.code === 'ENOENT'
            return res.status(500).json({ message: 'Error deleting the image file.' });
        }
        res.json({ message: 'Image deleted successfully!' });
    });
});

// API to get teachers who do not have an account yet
app.get('/api/teachers/no-account', isAuthenticated, isAdmin, (req, res) => {
    // This query selects teachers whose email is not in the accounts table
    const sql = 'SELECT full_name, email FROM teachers WHERE email NOT IN (SELECT email FROM accounts)';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error fetching teachers without accounts.' });
        }
        res.json(results);
    });
});

// Account Management APIs
app.get('/api/accounts', isAuthenticated, isAdmin, (req, res) => {
    con.query('SELECT id, email, role FROM accounts', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error fetching accounts.' });
        }
        res.json(results);
    });
});

app.post('/api/accounts/add', isAuthenticated, isAdmin, async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO accounts (email, passwords, role) VALUES (?, ?, ?)';
        con.query(sql, [email, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Error adding account.' });
            }
            res.json({ message: 'Account added successfully!' });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error during password hashing.' });
    }
});

app.post('/api/accounts/update', isAuthenticated, isAdmin, (req, res) => {
    const { id, role } = req.body;
    const sql = 'UPDATE accounts SET role = ? WHERE id = ?';
    con.query(sql, [role, id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error updating account.' });
        }
        res.json({ message: 'Account updated successfully!' });
    });
});

app.post('/api/accounts/delete', isAuthenticated, isAdmin, (req, res) => {
    const { id } = req.body;
    const sql = 'DELETE FROM accounts WHERE id = ?';
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error deleting account.' });
        }
        res.json({ message: 'Account deleted successfully!' });
    });
});

app.post('/api/accounts/change-password', isAuthenticated, isAdmin, async (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
        return res.status(400).json({ message: 'Account ID and new password are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'UPDATE accounts SET passwords = ? WHERE id = ?';
        con.query(sql, [hashedPassword, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Error changing password.' });
            }
            res.json({ message: 'Password changed successfully!' });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error during password hashing.' });
    }
});


app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the user already exists
        con.query('SELECT * FROM accounts WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }

            if (results.length > 0) {
                res.send('User already exists');
                return;
            }
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            // Hash the password before storing it
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user into the database
            con.query(
                'INSERT INTO accounts (email, passwords) VALUES (?, ?)',
                [email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Server error');
                        return;
                    }

                    res.redirect('/login');

                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// start the server in the port 3000 !
app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});