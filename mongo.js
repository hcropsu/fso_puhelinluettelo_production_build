const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Give database user\'s password as argument')
  process.exit(1)
}
const password = process.argv[2]

const url = `mongodb+srv://fullstackopen:${password}@cluster0.t09hw.mongodb.net/phonebookApp?
retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// const person = new Person({
//   name: 'Tuure',
//   number: '45',
// })

// person.save().then(result => {
//   console.log('person saved!')
//   console.log(result)
//   mongoose.connection.close()
// })

if (process.argv.length === 3) {
  console.log('Phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })  
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  person.save().then(result => {
    console.log(`Added ${result.name} with number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}

