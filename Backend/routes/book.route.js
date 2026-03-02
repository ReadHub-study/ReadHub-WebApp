import express from 'express'
import {
  uploadBook,
  deleteBook,
  getBooks,
  updateBookProgress,
  bookStatus,
} from '../controllers/book.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/upload', authenticate, uploadBook)
router.get('/', authenticate, getBooks)
router.put('/:bookId', authenticate, updateBookProgress)
router.get('/status', authenticate, bookStatus)
router.delete('/:bookId', authenticate, deleteBook)

export default router
