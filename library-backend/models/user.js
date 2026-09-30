const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
})

userSchema.pre('validate', async function () {
  if (!this.passwordHash) {
    this.passwordHash = await bcrypt.hash('secret', 10)
  }
})

module.exports = mongoose.model('User', userSchema)
