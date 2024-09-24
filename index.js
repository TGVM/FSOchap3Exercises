require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require("morgan")
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
//app.use(morgan("tiny"))

morgan.token('req-body', (req)=>{
    if(req.method === 'POST'){
        return JSON.stringify(req.body)
    }
    return ""
})

app.use(morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body"
))


let persons = [
]

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// app.get('/', (request, response) => {
//     response.send('<h1>Hello World!</h1>')
// })

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
  })

app.get('/info', (request, response) => {
    const dateNow = Date()
    const personLenght = 0
    Person.find({}).then(persons => {
      personLenght = persons.length
    })
    response.send(`<p>Phonebook has info for ${personLenght} people</p>
        <br/>
        <p>${dateNow}</p>
        `)
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
  
app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }
    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
      }
  
    const alreadyExists = () =>{
        persons.filter(p => p.name === body.name)
    }

    if(alreadyExists.length>0){
        return response.status(400).json({ 
            error: 'name must be unique' 
          })
    }

    const person = new Person({
      name: body.name,
      number: body.number
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})