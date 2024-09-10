require ('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Person = require('./modules/person')
const errorHandler = require('./modules/errorhandler')
const unknownEndpoint = require('./modules/unknownendpoint')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('reqpostcontent', function(req, res) {
  if (req.method === "POST") {
    return JSON.stringify(req.body)  
  }
})

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.reqpostcontent(req, res),
  ].join(' ')
}))

// This returns the frontend html document 'index.html' since express
// checks for it in the 'dist' folder thanks to 'app.use(express.static('dist))
app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

{/* It seems chrome isn't including the 'Date' header field in the request.
  It also seems that it is added so late to the response that accessing
  the 'Date' header of the response is tricky. So the date is constructed
  artificially. */}

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons  => {
      const numberOfPeople = persons.length
      console.log('numberOfPeople', numberOfPeople)
      const numberOfPeopleString = String(numberOfPeople)
      const dateNow = new Date().toString()
  
      if (numberOfPeople === 1) {
        return (
          res.send(
            `Phonebook has contact info for ${numberOfPeopleString} person. <br>${dateNow}`
          )
        )
      }
      res.send(
        `Phonebook has contact info for ${numberOfPeopleString} people. <br>${dateNow}`
      )
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then(person => {
      if(person) {
        res.json(person)
      } else {
        res.status(404).end()
      }  
    })
    .catch(error => next(error))
  
})

app.delete('/api/persons/:id', (req, res, next) => {
  const idOfPersonToDelete = req.params.id
  Person.findByIdAndDelete(idOfPersonToDelete)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const newName = body.name
  const newNumber = body.number

  if (!newName) {
    return res.status(400).json({
      error: "missing name"
    })
  }

  if (!newNumber) {
    return res.status(400).json({
      error: "missing number"
    })
  }

  const newPerson = new Person ({
    name: newName,
    number: newNumber,
  })

  newPerson.save()
    .then(result => {
      console.log('saved new person', result)
      res.json(result)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const idOfPersonToUpdate = req.params.id
  const personToUpdate = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(idOfPersonToUpdate, personToUpdate, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
