const { request, response } = require("express")
const express = require("express")
const app = express()

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.use(express.json())

app.get('/api/persons', 
        (request, response) => {
            response.json(persons)
        }
    )

app.get(`/info`,
        (request, response) => {
            const numOfPersons = persons.length
            const currentTime = Date();
            const info = `Phonebook has info fot ${numOfPersons} people \n` + currentTime 
            response.end(info)
        }
    )

app.get('/api/persons/:id', 
        (request, response) => {
            const id = Number(request.params.id)
            const person = persons.find(p => p.id === id)
            if(person){
                response.json(person)
            }else{
                response.status(404).end()
            }
        }
    )

app.post('/api/persons/', 
        (request, response) => {
            const id = Math.floor(Math.random()*999999999999)
            const person = request.body

            if(!person.name || !person.number) {
                return response.status(400).json({error: `name or number is missing`})
            }

            if(persons.reduce((p,c) => c.name === person.name ? ++p : p, 0)) {
                return response.status(400).json({error: `name must be unique`})
            }

            const newPerson = {
                name: person.name,
                number: person.number,
                id: id
            }

            persons = persons.concat(newPerson)

            response.json(newPerson)
        }
    )

app.delete('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server runnig on ${PORT}`)
})