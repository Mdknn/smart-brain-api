// const http = require('http')
// const server= http.createServer((request, response)=>{
//     const user = {
//       name: "kaif",
//       age:   "23"
//     }
//      response.setHeader('Content-Type','application/json');
//      response.end(JSON.stringify(user))
//     })
// server.listen(3000);
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');
// const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';


   const db = knex({
     client: 'pg',
     connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'kaif',
    database : 'smart-brain'
  }
});
const pg = require('knex')({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
});
// postgres.select('*').from('users') 
// const app = bodyParser;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
// app.use(Express);
// const database = {
//   users : [
//     {
//   id: '123',
//   name: 'kaif',
//   email: 'kaif@gmail.com',
//   password: 'mango',
//   entries: 0,
//   joined: new Date()
//   },
//   {
//   id: '124',
//   name: 'knkn',
//   email: 'knkn@gmail.com',
//   password: 'banana',
//   entries: 0,
//   joined: new Date()

// }


// ],
// login : [{
//   id: '676',
//   hash: '',
//   email: 'kaif@gmail.com'
// }
// ]


// };
app.get('/',(req,res) => {res.send('it is working')})

app.post('/user', (req,res,) => {
  // if(req.body.email === database.users[0].email && req.body.password === database.users[0].password)
  // {
  //   res.json('sucess');
  // }
  db.select('email','hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
    if(isValid){
      return db.select('*').from('users')
      .where('email','=', req.body.email)
      .then(user => {
        res.json(user[0])
      })
      .catch(err => res.status(400).json('not found'))
    } 
    else {
       res.status(400).json('error')  
    }
  })
  .catch(err => res.status(400).json('wrong credential'))
  
})
app.post('/register', (req,res) => {
  const {email,name, password } = req.body;
  if (!email || !name || !password)
  {
     return res.status(400).json('incorrect value')
  }
  const hash = bcrypt.hashSync(password,12);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
      
    })
    .into('login')
    .returning('email')
    .then(loginEmail =>{
        return trx('users')
      .returning('*')
     .insert({
    
    email: loginEmail[0].email,
    name: name,
    joined: new Date()
  }).then(user =>{
    res.json(user[0])
  })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  

  .catch(err => res.status(400).json('not found'))
//   bcrypt.hash(password, null,null, function(err, hash) {
//     // Store hash in your password DB.
// });
  // const email = req.body;
  // const password = req.body;
  // const name = req.body;
  // database.users.push(
  // {
  //   id: id,
  //   name:  name,
  //   email:  email,
  //   password:  password,
  //   entries: 0,
  //   joined: new Date()
  // }  
  
  // )
  // res.json(database.users[database.users.length-1])
})
app.get('/get', (req,res) => {
  res.send(database.users)
})
app.get('/profile/:id', (req,res) => {
  const {id} = req.params;
  db.select('*').from ('users').where({id})
  .then(user => {
    if(user.length){
      res.json(user[0])
    }
    else{
      res.status(400).json('not found')
    }
  })
   
    .catch(err => res.status(400).json('not found'))
  
})
app.put('/image',(req,res) =>{
  const { id }  = req.body;
  db('users').where('id','=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('not found'))
  
})
app.listen(process.env.PORT || 3000, () => {
  console.log("logging")
})
