const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config');


// file upload
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
// file upload end

const app = express();
app.use(bodyParser.json());

const port = 8000;

// const allowedFileTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf',];

// app.post('/upload', (req, res) => {
//   const form = new formidable.IncomingForm();
//   // Set the upload directory
//   form.uploadDir = path.join(__dirname, 'uploads');
//   // Keep the original file extensions
//   form.keepExtensions = true;
//   form.parse(req, (err, fields, files) => {
//     if (err) {
//       return res.status(500).json({ error: 'File upload failed' });
//     }
//     const updatedFiles = {};
//     let errorOccurred = false;
//     for (const fileKey in files) {
//       const file = files[fileKey];
//       if (Array.isArray(file)) {
//         file.forEach(f => {
//           const originalExt = path.extname(f.originalFilename).toLowerCase();
//           if (!allowedFileTypes.includes(f.mimetype) || !['.png', '.jpg', '.jpeg', '.svg', '.pdf'].includes(originalExt)) {
//             // Remove the invalid file
//             fs.unlinkSync(f.filepath);
//             errorOccurred = true;
//             return res.status(400).json({ error: 'Invalid file type' });
//           } else {
//             const newFilePath = `${f.filepath}${originalExt}`;
//             fs.renameSync(f.filepath, newFilePath);
//             f.filepath = newFilePath;
//             if (!updatedFiles[fileKey]) {
//               updatedFiles[fileKey] = [];
//             }
//             updatedFiles[fileKey].push(f);
//           }
//         });
//       } else {
//         const originalExt = path.extname(file.originalFilename).toLowerCase();
//         if (!allowedFileTypes.includes(file.mimetype) || !['.png', '.jpg', '.jpeg', '.svg', '.pdf'].includes(originalExt)) {
//           // Remove the invalid file
//           fs.unlinkSync(file.filepath);
//           errorOccurred = true;
//           return res.status(400).json({ error: 'Invalid file type' });
//         } else {
//           const newFilePath = `${file.filepath}${originalExt}`;
//           fs.renameSync(file.filepath, newFilePath);
//           file.filepath = newFilePath;
//           updatedFiles[fileKey] = file;
//         }
//       }
//     }
//     if (!errorOccurred) {
//       res.json({
//         fields,
//         files: updatedFiles
//       });
//     }
//   });
// });
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.post('/upload-file', function(req, res) {
    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        console.log(files,">>>>>>>>>>>>")
        if (err) {
            console.error('Error', err);
            return res.status(500).json({ error: 'File upload failed' });
        }

        const file = files.file; 
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const oldPath = file.filepath;
        const newPath = path.join(uploadDir, file.originalFilename);

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error('Error moving file:', err);
                return res.status(500).json({ error: 'File processing failed' });
            }
            res.status(200).json({ message: 'File uploaded successfully', filename: file.originalFilename });
        });
    });
});

// app.use('/*', function(req, res) {
//     return res.status(200).json({ message: 'message received' });
// });



// create User
app.post('/createUser', (req, res) => {
    const { name, email } = req.body;
    const sql1 = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(sql1, [name, email], (err, result1) => {
        if (err) {
            return res.status(500).send(`Error adding user: ${err}`);
        }
        const userId = result1.insertId;
        const sql2 = 'INSERT INTO posts (user_id,title,content) VALUES (?, ?, ?)';
        
        db.query(sql2, [userId, 'User Created', `User ${name} with email ${email} was created.`], (err, result2) => {
            if (err) {
                return res.status(500).send(`Error logging user creation: ${err.message}`);
            }
            res.send('User added successfully and logged in posts');
        });
    });
});



// getAll Users
app.post('/getallUsers', async (req, res) => {
    try {
        const sql = 'SELECT users.id AS userId,users.name,users.email, posts.title, posts.content FROM users,posts where users.id = posts.user_id';
        db.query(sql, (err, results) => {
            if (err) {
                throw err;
            }
            res.json(results);
        });
    } catch (error) {
        res.status(500).send(`Error fetching users: ${error.message}`);
    }
});




// // get Indiviudal User BY ID
app.post('/getUserbyId', async (req, res) => {
    try {
        const id  = req.body.id;
        const sql = 'SELECT users.name, users.email,posts.title,posts.content FROM users,posts WHERE users.id  = ? AND users.id = posts.user_id';
        db.query(sql, [id], (err, result) => {
            if (err) {
                throw err;
            }
            res.json(result[0]);
        });
    } catch (error) {
        res.status(500).send(`Error fetching user: ${error.message}`);
    }
});

// Update a user by ID
app.post('/updateUser', async (req, res) => {
    try {
        // const { name, email } = req.body;
        const value = [req.body.name,req.body.email,req.body.id];
        const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
        db.query(sql,value, (err, result) => {
            if (err) {
                throw err;
            }
            res.send('User updated successfully');
        });
    } catch (error) {
        res.status(500).send(`Error updating user: ${error.message}`);
    }
});

// update posts
app.post('/updatePosts', async (req, res) => {
    try {
        const value = [req.body.title,req.body.content,req.body.id];
        const sql = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
        db.query(sql,value, (err, result) => {
            if (err) {
                throw err;
            }
            res.send('User updated successfully');
        });
    } catch (error) {
        res.status(500).send(`Error updating user: ${error.message}`);
    }
});


//delete posts And user
app.post('/deletePosts', async (req, res) => {
    try {
        const id  = req.body.id;
        const sql1 = 'DELETE FROM posts WHERE user_id = ?';
        db.query(sql1, [id], (err, result1) => {
            if (err) {
                return res.status(500).send(`Error delte user: ${err.message}`);
            } 
            const sql2 = 'DELETE FROM users WHERE id = ?';
            db.query(sql2,[id],(error,result2) =>{
                if(error){
                    return res.status(500).send(`Error delte posts: ${error.message}`);
                }
                res.send('data deleted successfully');
            })
        });
    } catch (error) {
        res.status(500).send(`Error deleting user: ${error.message}`);
    }
});




app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
