require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()
const Person = require('./models/person')
const { notEqual } = require('assert')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token("req-body", (req, res) => JSON.stringify(req.body))
const myMorgan = morgan(':method :url :status :res[content-length] - :response-time ms :req-body')
app.use(myMorgan)

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {response.json(result)})})

app.get(`/info`, (request, response) => {
        Person.countDocuments({}).then(result => {
            const currentTime = Date();
            const info = `Phonebook has info for ${result} people \n` + currentTime
            response.end(info)
        })
    }
)

app.get('/api/persons/:id',(request, response, next) => {
        Person.findById(request.params.id)
            .then(person => {
                if (person) {
                    response.json(person)
                } else {
                    response.status(404).end()
                }
            })
            .catch(error => next(error))
    }
)

app.post('/api/persons/', (request, response, next) => {
    const body = request.body

    Person.find({ name: body.name })
        .then(result => {
            if (result.length === 0) {
                const newPerson = new Person({
                    name: body.name,
                    number: body.number,
                })
                newPerson.save()
                    .then(savedPerson => response.json(savedPerson))
                    .catch(error => next(error))
            } else {
                response.status(400).json({ error: `name must be unique` })
            }
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            console.log(JSON.stringify(result));
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const person = {
        name: request.body.name,
        number: request.body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(result => {
            response.json(result)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id' })
    } else if (error.name == 'ValidationError') {
        response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server runnig on ${PORT}`)
})