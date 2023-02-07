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

app.get(`/info`,
    (request, response) => {
        Person.countDocuments({}).then(result => {
            const currentTime = Date();
            const info = `Phonebook has info for ${result} people \n` + currentTime
            response.end(info)
        })
    }
)

app.get('/api/persons/:id',
    (request, response) => {
        Person.findById(request.params.id)
            .then(person => {response.json(person)})
            .catch(error => {response.status(404).end()})
    }
) 

app.post('/api/persons/',
    (request, response) => {
        const body = request.body

        if (!body.name || !body.number) {
            return response.status(400).json({ error: `name or number is missing` })
        }

        Person.find({name:body.name}) 
            .then(result => {
                console.log(JSON.stringify(result));
                if (result.length === 0) {
                    const newPerson = new Person({
                        name: body.name,
                        number: body.number,
                    })
                    newPerson.save().then(savedPerson => response.json(savedPerson))
                } else{
                    response.status(400).json({ error: `name must be unique` })
                }
            })
    }
)

app.delete('/api/persons/:id', (request, response) => {
        Person.deleteOne({_id:request.params.id})
            .then(result => {
                console.log(JSON.stringify(result));
                response.status(204).end()})
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server runnig on ${PORT}`)
})