require('dotenv').config()
require('./mongo')
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/Note')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')
app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
	Note.find({}).then(notes =>{
		response.json(notes)
	})
})

app.get('/api/notes/:id', (request, response, next) => {
	const id  = request.params.id
	Note.findById(id)
		.then(note => {
			if (note) return response.json(note)
			response.status(404).end()
		})
		.catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
	const {id} = request.params
	const note = request.body
	const newNoteInfo = {
		content: note.content,
		important: note.important
	}
	Note.findByIdAndUpdate(id, newNoteInfo, {new: true})
		.then(result => {
			response.json(result).status(200).end()
		})
		.catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
	const {id} = request.params
	Note.findByIdAndDelete(id).then(() => {
		response.status(204).end()
	}).catch(error => next(error))
})

app.post('/api/notes', (request, response) => {
	const note = request.body
	if (!note || !note.content) {
		response.status(204).json({
			error: 'note.content is missing'
		})
	}
	const newNote = new Note({
		content: note.content,
		date: new Date().toISOString(),
		important: typeof note.important !== 'undefined' ? note.important : false
	})
	newNote.save().then(savedNote => {
		response.status(201).json(savedNote)
	})
})

app.use(notFound)
app.use(handleErrors)
// eslint-disable-next-line no-undef
const PORT= process.env.PORT

app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}` )
})