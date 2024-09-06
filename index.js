const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

app.use(cors())
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

let persons = [
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": "1"
  },
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": "2"
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": "3"
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": "4"
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

{/* It seems chrome isn't including the 'Date' header field in the request.
  It also seems that it is added so late to the response that accessing
  the 'Date' header of the response is tricky. So the date is constructed
  artificially. */}

app.get('/info', (req, res) => {
  const numberOfPeople = persons.length
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

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(p => p.id === id)
  if(person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

const generateRandomId = () => {
  return Math.floor(Math.random() * 1000)
}

app.post('/api/persons', (req, res) => {
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

  if (persons.find(p => p.name === newName)) {
    return res.status(400).json({
      error: "name must not already exist in phonebook"
    })
  }

  const newId = generateRandomId()
  const newPerson = {
    name: newName,
    number: newNumber,
    id: newId
  }
  persons = persons.concat(newPerson)
  res.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
