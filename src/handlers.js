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
  usersDB.get('users').push({ id, username, password });
  usersDB.update('num', n => n + 1);
  usersDB.write();
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
    return res.send({ error: 'quiz not found.' });
  } else {
    return res.send(quiz);
  }
}

function handleQuizzesSubmit(req, res) {
  const { id } = req.user.user;
  const { questionId, answer } = req.body;

  const entryObj = { userId: id, questionId: Number(questionId) };
  const answerObj = { answer: Number(answer) };
  const answerData = { ...entryObj, ...answerObj };
  console.log(answerData);

  const oldAnswer = answersDB.get('answers').find(entryObj).value();
  console.log(oldAnswer);

  if (oldAnswer) {
    answersDB.get('answers').find(entryObj).assign(answerObj).write();
  } else {
    answersDB.get('answers').push(answerData).write();
  }

  //TODO: send results? or nothing
  return res.send({ results: 'all wrong lul' });
}

module.exports = {
  logger,
  handleLoginSubmit,
  handleQuizzesRequest,
  handleQuizzesSubmit,
};
