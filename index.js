const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bcrypt = require('bcrypt')

const server = express();

server.use(helmet())
server.use(express.json())
server.use(cors())

const port = process.env.PORT || 6492;
server.listen(port, () => 
console.log(`\n** We're live on port ${port}!**\n`))