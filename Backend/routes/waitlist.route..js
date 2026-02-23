import express from 'express'
import {
  addToWaitlist,
  getWaitlist,
} from '../controllers/waitlist.controller.js'

const router = express.Router()

router.post('/add', addToWaitlist)
router.get('/users', getWaitlist)

export default router
