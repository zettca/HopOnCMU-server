const jwt = require('jsonwebtoken');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const usersDB = low(new FileSync('db/users.json'));
const quizzesDB = low(new FileSync('db/quizzes.json'));
const answersDB = low(new FileSync('db/answers.json'));

const JWT_SECRET = process.env.SECRET || 'BANANAS';

usersDB.defaults({ users: [] }).write();
quizzesDB.defaults({ locations: [], questions: [] }).write();
answersDB.defaults({ answers: [] }).write();

// ===== HELPERS

function logger(req, res, next) {
  console.log(`${req.ip}: ${req.originalUrl}`);
  next();
}

function register(username, password) {
  const id = Date.now();
  const userData = { id, username, password };
  usersDB.get('users').push(userData).write();
  return jwt.sign(userData, JWT_SECRET);
}

function userIdToName(id) {
  const user = usersDB.get('users').find({ id }).value();
  return user.username;
}

// ===== API Handlers

function handleLoginSubmit(req, res) {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.send({ error: 'send username and password pls' });
  } else {
    username = username.trim();
    password = password.trim().replace(/ /g, '+');
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

function handleLocationsRequest(req, res) {
  const locations = quizzesDB.get('locations').value();
  const locData = locations.map(loc => ({ name: loc.name, numQuestions: loc.questions.length }));
  console.log(locData);

  res.send(locData);
}

function handleRankingRequest(req, res) {
  const users = usersDB.get('users');
  const questions = quizzesDB.get('questions');
  const answers = answersDB.value();
  const ranking = {}

  answers.forEach(ans => {
    const { answer } = questions.find({ id: ans.questionId }).value();
    const username = userIdToName(ans.userId);

    if (ranking[username] === undefined) {
      ranking[username] = 0;
    }

    if (answer == ans.answer) {
      ranking[username] += 10;
    }
  });

  console.log('Sending ranking...');
  console.log(ranking);

  res.send(ranking);
}

function handleQuizzesRequest(req, res) {
  const { location } = req.query;
  if (!location) {
    return res.send({ error: 'send quiz location pls' });
  }

  const loc = quizzesDB.get('locations').find({ id: location }).value();
  const quiz = quizzesDB.get('questions');

  const questions = loc.questions.map(id => quiz.find({ id }).value());
  console.log(loc.questions);

  if (questions == null) {
    return res.send({ error: 'quiz not found.' });
  } else {
    return res.send(questions);
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
  handleLocationsRequest,
  handleRankingRequest,
  handleQuizzesRequest,
  handleQuizzesSubmit,
};
