const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const knex = require('knex')

const server = express();

const config = {
    client: "sqlite3",
    connection: {
      filename : './data/authi.db3'
    },
    useNullasDefault: true
};
const db = knex(config)

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

server.post('/api/login', async(req, res) => {
    let { username, password } = req.body
    try{
    const foundUser = await findUser({ username })//why destructure needed 
    .first()
        if(foundUser && bcrypt.compareSync(password, foundUser.password)) {
             res.status(200).json({ message: `Welcome ${foundUser.username}!`})
        } else {
            res.status(401).json({ message:'Invalid credentials' })
        } 
    } catch(error){
            res.status(500).json({ message:"Error Logging in" })
    }
})




//~~~~~~~~~~~~~~~~~~~server~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const port = process.env.PORT || 6492;
server.listen(port, () => 
console.log(`\n** We're live on port ${port}!**\n`))