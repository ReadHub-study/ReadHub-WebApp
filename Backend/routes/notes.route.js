import express from 'express'
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
} from '../controllers/notes.controller.js'
import { authenticate } from './../middlewares/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.post('/', createNote)
router.get('/', getAllNotes)
router.get('/:id', getNoteById)
router.delete('/:id', deleteNote)

export default router
