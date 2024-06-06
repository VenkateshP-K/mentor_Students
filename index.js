const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Mentor, Student } = require('./model');

const app = express();
app.use(bodyParser.json());

// Create Mentor API
app.post('/mentors/create', async (req, res) => {
  try {
    const { mentorName, mentorEmail } = req.body;
    const newMentor = new Mentor({ mentorName, mentorEmail });
    await newMentor.save();
    res.json(newMentor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Student API
app.post('/students/create', async (req, res) => {
  try {
    const { studentName, studentEmail } = req.body;
    const newStudent = new Student({ studentName, studentEmail });
    await newStudent.save();
    res.json(newStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign Mentor to Student API
app.put('/students/:studentId/assign-mentor/:mentorId', async (req, res) => {
  try {
    const { studentId, mentorId } = req.params;
    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    student.mentor = mentor._id;
    await student.save();

    mentor.students.push(student._id);
    await mentor.save();

    res.json({ message: 'Mentor assigned successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Show previously assigned mentor for a student
app.get('/students/:studentId/mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate('mentor');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student.mentor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students assigned to a mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId).populate('students');
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.json(mentor.students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all mentors
app.get('/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect('mongodb://localhost:27017/mentor-student')
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(3500, () => {
    console.log('Server is running');
  });
})
.catch((error) => {
  console.log(error);
});