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

/**
 * @swagger
 * /api/books/upload:
 *   post:
 *     summary: Upload a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - coverImageUrl
 *               - fileUrl
 *               - pages
 *             properties:
 *               title:
 *                 type: string
 *                 example: Atomic Habits
 *               coverImageUrl:
 *                 type: string
 *                 example: https://res.cloudinary.com/demo/image/upload/book.jpg
 *               fileUrl:
 *                 type: string
 *                 example: https://res.cloudinary.com/demo/raw/upload/book.pdf
 *               pages:
 *                 type: number
 *                 example: 320
 *     responses:
 *       201:
 *         description: Book uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', authenticate, uploadBook)
/**
 * @swagger
 * /api/book:
 *   get:
 *     summary: Get all books uploaded by the logged-in user
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's books
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getBooks)
/**
 * @swagger
 * /api/book/{bookId}:
 *   put:
 *     summary: Update book reading progress or status
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         description: ID of the book
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastPageRead:
 *                 type: number
 *                 example: 120
 *               status:
 *                 type: string
 *                 example: reading
 *     responses:
 *       200:
 *         description: Book progress updated successfully
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:bookId', authenticate, updateBookProgress)
/**
 * @swagger
 * /api/book/status:
 *   get:
 *     summary: Get books grouped by reading and completed status
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reading and completed books
 *       401:
 *         description: Unauthorized
 */
router.get('/status', authenticate, bookStatus)
/**
 * @swagger
 * /api/book/{bookId}:
 *   delete:
 *     summary: Delete a book uploaded by the logged-in user
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         description: ID of the book
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:bookId', authenticate, deleteBook)

export default router
