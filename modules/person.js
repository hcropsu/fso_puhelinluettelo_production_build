const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log(`Connecting to ${url}...`)

mongoose.connect(url)
  .then(() => {
    console.log('Succesfully connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB: ', error)
  })

const numberValidator = (number) => {
  return /(\d{2}-\d{5,})|(\d{3}-\d{4,})/.test(number)
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: numberValidator
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)