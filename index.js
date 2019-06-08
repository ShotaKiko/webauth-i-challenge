const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const knex = require('knex')
const session = require('express-session')

const server = express();
const restricted = require('./middleware/restricted-middleware.js')

const config = {
    client: "sqlite3",
    connection: {
      filename : './data/authi.db3'
    },
    useNullasDefault: true
};
const db = knex(config)

const sessionConfig = {
    name:'code-gorilla',
    secret:'i like vegetables',
    resave: false,
    saveUninitialized:false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,//two hours,
        secure: false,
        httpOnly: true
    }
}

server.use(session(sessionConfig))
server.use(helmet())
server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
    res.send("<h2> WEBAUTH1 Ready for action </h2>")
})
//~~~~~~~~~~~~~~~~~~~~user registration~~~~~~~

//helper
function addUser(newUser){
    return db('users').insert(newUser)
}
server.post('/api/register', async (req, res) => {
    try {
        let user = req.body
            
            if (!user.username || !user.password){
                return res.status(500).json({ message: "Please provide a username and password." })
            } 
            
            if (user.password.length < 6){
                return res.status(500).json({ message:"Your password must be at least six characters long." })
            }
        
        const hash =bcrypt.hashSync(user.password, 12)
        user.password = hash
        const addedUser = await addUser(user)
        res.status(201).json(addedUser)
    } catch (error) {
        res.status(500).json({ message:'Error adding user.' })
    }
})
//helper
function findUser(filter) {
    return db('users').where(filter)
}
//~~~~~~~~~~~~~~~~~~~~login~~~~~~~~~~~~~~~~~~~~~~~~~~~
server.post('/api/login', async(req, res) => {
    let { username, password } = req.body
    try{
    const foundUser = await findUser({ username })//why destructure needed 
    .first()
        if(foundUser && bcrypt.compareSync(password, foundUser.password)) {
            req.session.user = foundUser;
            res.status(200).json({ message: `Welcome ${foundUser.username}, you are awesome!`})
        } else {
            res.status(401).json({ message:'Invalid credentials' })
        } 
    } catch(error){
            res.status(500).json({ message:"Error Logging in" })
    }
})
//~~~~~~~~~~~~~~~~~get endpoint~~~~~~~~~~~~~
//helper
function findAll(){
    return db('users').select('id','username', 'password')
}

// function authorizeUser (req, res, next) {
//     const username = req.headers['x-username']
//     const password = req.headers['x-password']
    
//     if (!username || !password) {
//         return res.status(401).json({ message: 'Invalid Credentials' });
//     }

//     findUser({ username })//
//     .first()
//     .then(activeUser => {
//         if(activeUser && bcrypt.compareSync(password, activeUser.password)){
//             next()
//         } else {
//             res.status(401).json({ message: 'invalid creds' })
//         }
//     })
//     .catch(err => {
//         res.status(500).json(err)
//     })
// }
//now with session created will use restricted middleware and session cookie


server.get('/api/users', restricted, async (req, res) => {
    try{
        const userAuthorizedFetchList = await findAll()
        res.status(200).json(userAuthorizedFetchList)
    } catch(error){
        res.status(500).json({ message:"Unable to retrieve user list"})
    }
  })




//~~~~~~~~~~~~~~~~~~~server~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const port = process.env.PORT || 6492;
server.listen(port, () => 
console.log(`\n** We're live on port ${port}!**\n`))