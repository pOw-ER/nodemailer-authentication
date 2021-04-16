const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const fs = require('fs');
require('dotenv').config()
let PORT = process.env.PORT || 3006
const { v4: uuidv4 } = require('uuid');
const users = require('./users.json')
app.listen(PORT, () => {
  console.log('it works');
})

app.use(express.static('public'))
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))
// parse application/json
app.use(express.json())



app.get('/', (req, res) => {
  res.redirect('/login')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/register', (req, res) => {
  res.render('register')
})
app.get('/link', (req, res) => {
  res.render('confirmPage')
})
app.get('/admin', (req, res) => {
  res.render('admin')
})
app.post('/new', (req, res) => {
  let user = {
    id: uuidv4(),
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    confirmationCode: uuidv4(),
    password: req.body.pass,
    active: 'pending'
  }
  console.log(user);
  // console.log(users);
  let userCheck = users.filter(elt => user.id == elt.id)
  console.log(userCheck.length, 'hey');
  if (userCheck.length === 0) {
    users.push(user)
    fs.writeFile('./users.json', JSON.stringify(users), 'utf8', (err) => {
      if (err) throw err;
      console.log('works');
    })
    const transporter = nodemailer.createTransport({
      service: 'gmail', // no need to set host or port etc.
      auth: {
        user: process.env.CLIENT_EMAIL,
        pass: process.env.CLIENT_PASS
      }
    });

    let info = transporter.sendMail({
      from: '"SUPERWOMAN" <supercoder.pow.enes@gmail.com>', // sender address
      to: "buesrakement@gmail.com", // list of receivers
      subject: "SUPER BOY ✔", // Subject line
      text: "DU BIST SUPER?", // plain text body
      html: `<b>DU BIST SUPER</b>
        <a href= "http://localhost:${PORT}/confirm/${user.confirmationCode}">Hier click to confirm</a>
      `, // html body

    }, (err, info) => {
      if (err) throw err
      console.log(info.message);

    });
    res.redirect('/link')
  } else {
    res.redirect('/login')
  }
})

app.get('/confirm/:code', (req, res) => {
  let confirmedUser = users.filter(elt => elt.confirmationCode === req.params.code)
  console.log(confirmedUser[0].active);
  confirmedUser[0].active = 'active'
  fs.writeFile('./users.json', JSON.stringify(users), 'utf8', (err) => {
    if (err) throw err;
    console.log('works');
  })
  res.send(`<h1>Your account confirmed</h1>
  <a href="/login">Zurück zu Login</a>
  `)
})

app.post('/userlogin', (req, res) => {
  let userLog = users.filter(elt => elt.email === req.body.loginEmail)
  if (userLog[0].password == req.body.loginPass) {
    res.redirect('/admin')
  } else {
    res.redirect('/register')
  }
})
