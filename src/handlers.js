const jwt = require('jsonwebtoken');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const usersDB = low(new FileSync('db/users.json'));
const quizzesDB = low(new FileSync('db/quizzes.json'));
const answersDB = low(new FileSync('db/answers.json'));

const JWT_SECRET = process.env.SECRET || 'BANANAS';

usersDB.defaults({ num: 0, users: [] }).write();
quizzesDB.defaults({ questions: [], answers: [] }).write();
answersDB.defaults({ answers: [] }).write();

// ===== HELPERS

function logger(req, res, next) {
  console.log(`${req.ip}: ${req.originalUrl}`);
  next();
}

function register(username, password) {
  const id = usersDB.get('num').value() + 1;
  usersDB.get('users').push({ id, username, password }).write();
  usersDB.update('num', n => n + 1).write();
  return jwt.sign({ id, username, password }, JWT_SECRET);
}

// ===== API Handlers

function handleLoginSubmit(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send({ error: 'send username and password pls' });
  }

  const user = usersDB.get('users').find({ username }).value();
  const token = jwt.sign({ user }, JWT_SECRET);
  console.log(user);

  if (user == null) {
    console.log(`Registering user ${username}:${password}...`);
    register(username, password);
    return res.send({ token });
  } else if (user.password === password) {
    console.log(`Logged in user ${user.username}`);
    return res.send({ token });
  } else {
    console.log(`Fail login attempt by ${username}:${password}`);
    return res.send({ error: 'wrong password' });
  }
}

function handleQuizzesRequest(req, res) {
  const { location } = req.query;
  if (!location) {
    return res.send({ error: 'send quiz location pls' });
  }

  const quiz = quizzesDB.get('questions').filter({ location }).value();

  if (quiz == null) {
    return res.send({ error: `quiz location=${location} was not found.` });
  } else {
    return res.send(quiz);
  }
}

function handleQuizzesSubmit(req, res) {
  const quizId = Number(req.params.id);

  console.log(`Request for quizId=${quizId}`);
  res.send({
    id: 5,
    questions: [
      'question1',
      'question2',
    ],
  });
}

module.exports = {
  logger,
  handleLoginSubmit,
  handleQuizzesRequest,
  handleQuizzesSubmit,
};
