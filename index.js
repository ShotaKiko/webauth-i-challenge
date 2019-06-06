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
        const hash =bcrypt.hashSync(user.password, 12)
        user.password = hash
        const addedUser = await addUser(user)
        res.status(201).json(addedUser)
    } catch (error) {
        res.status(500).json({ message:'Error adding user.' })
    }
})





//~~~~~~~~~~~~~~~~~~~server~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const port = process.env.PORT || 6492;
server.listen(port, () => 
console.log(`\n** We're live on port ${port}!**\n`))