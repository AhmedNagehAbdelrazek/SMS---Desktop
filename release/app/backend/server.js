const express = require('express');
const sequelize = require('./config/database');  // Sequelize instance
const Student = require('./models/Student');  // Import the Student model
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({methods:"GET,HEAD,PUT,PATCH,POST,DELETE", origin:"*"}));

// Sync the database, creating the SQLite file and tables if they don’t exist
sequelize.sync({ alter: true })  // `alter: true` ensures tables match models
    .then(async () => {

        const dummy = await Student.create({ name: 'Dummy' });

        // Delete the dummy record
        await Student.destroy({ where: { id: dummy.id } });

        const [results, metadata] = await sequelize.query("UPDATE sqlite_sequence SET seq = 1000 WHERE name = 'Students'");
        console.log(results);

        console.log('Database & tables created!');
    })
    .catch((error) => console.error('Error syncing database:', error));

app.get('/', async (req, res) => {
    const students = await Student.findAll({attributes:["name","id"]});
    res.status(200).json(students);
})
app.post('/', async (req, res) => {
    const newStudent = await Student.create({...req.body});
    res.status(200).json(newStudent);
});

app.delete('/', async (req, res) => {
  await Student.truncate();
  res.status(200);
});

export default function server(){
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}
