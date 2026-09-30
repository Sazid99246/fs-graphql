require('dotenv').config()

const connectToDatabase = require('./db')
const startServer = require('./server')

const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT || 4000

const main = async () => {
  await connectToDatabase(MONGO_URI)
  startServer(PORT)
}

main()
