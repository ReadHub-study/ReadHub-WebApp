import cloudinary from '../config/cloudinary.js'
import Book from '../models/Books.js'
import ReadingSession from '../models/readingSession.js'
import UserStats from '../models/userStatistics.js'
import Notes from './../models/Notes.js'

export const generatePdfSignature = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

    const timestamp = Math.round(Date.now() / 1000)

    const paramsToSign = {
      timestamp,
      folder: 'documents',
      allowed_formats: 'pdf,doc,docx,txt',
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET,
    )

    res.json({
      ...paramsToSign,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const uploadBook = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { title, coverImageUrl, fileUrl, pages } = req.body
    if (!title || !coverImageUrl || !fileUrl || !pages) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (
      !coverImageUrl.includes(
        `res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`,
      )
    ) {
      return res.status(400).json({ error: 'Invalid image source' })
    }
    if (
      !fileUrl.includes(
        `res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`,
      )
    ) {
      return res.status(400).json({ error: 'Invalid file source' })
    }
    const newBook = new Book({
      title,
      coverImageUrl,
      fileUrl,
      pages,
      uploadedBy: req.user.id,
    })
    await newBook.save()
    res
      .status(201)
      .json({ message: 'Book uploaded successfully', book: newBook })
  } catch (error) {
    console.error('Error uploading book:', error)
    res.status(500).json({ message: `Error uploading book ${error.message}` })
  }
}

export const getBooks = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const books = await Book.find({ uploadedBy: req.user.id }).sort({
      createdAt: -1,
    })
    if (!books || books.length === 0) {
      return res
        .status(200)
        .json({ message: 'No books found for this user', books: [] })
    }

    res.json(books)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error from Book API', error: error.message })
  }
}

export const updateBookProgress = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { bookId } = req.params
    const { lastPageRead, status } = req.body
    const book = await Book.findOne({ _id: bookId, uploadedBy: req.user.id })
    if (!book) {
      return res.status(404).json({ message: 'Book not found' })
    }
    if (lastPageRead !== undefined) {
      book.lastPageRead = lastPageRead
    }
    if (status) {
      book.status = status
    }
    await book.save()
    res.json({ message: 'Book progress updated successfully', book })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error updating book progress', error: error.message })
  }
}

export const bookStatus = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

    const readingBooks = await Book.find({
      uploadedBy: req.user.id,
      status: 'reading',
    })
    const completedBooks = await Book.find({
      uploadedBy: req.user.id,
      status: 'completed',
    })

    res.json({
      reading: readingBooks,
      completed: completedBooks,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching book status', error: error.message })
  }
}

export const deleteBook = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { bookId } = req.params
    const book = await Book.findOneAndDelete({
      _id: bookId,
      uploadedBy: req.user.id,
    })
    if (!book) {
      return res.status(404).json({ message: 'Book not found' })
    }
    await Notes.deleteMany({ book: bookId, user: req.user.id })
    await ReadingSession.deleteMany({ book: bookId, user: req.user.id })
    res.json({ message: 'Book deleted successfully' })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error deleting book', error: error.message })
  }
}

export const startReading = async (req, res) => {
  try {
    const { bookId, startPage } = req.body

    let readingBook = await ReadingSession.findOne({
      book: bookId,
      user: req.user.id,
    })

    if (!readingBook) {
      readingBook = await ReadingSession.create({
        user: req.user.id,
        book: bookId,
        startTime: new Date(),
        startPage,
      })
    } else {
      readingBook.startPage = startPage
      readingBook.startTime = new Date()
      await readingBook.save()
    }

    return res.status(201).json({
      message: 'Session recorded',
      session: readingBook,
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ message: error.message })
  }
}

export const endReading = async (req, res) => {
  try {
    const { sessionId, endPage } = req.body
    const userId = req.user.id

    const session = await ReadingSession.findById(sessionId)

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    session.endTime = new Date()

    const duration = (session.endTime - session.startTime) / 1000 / 60
    session.duration = Math.round(duration)
    session.endPage = endPage
    session.pagesRead = endPage - session.startPage

    await session.save()

    // UPDATE USER STATS
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let stats = await UserStats.findOne({ user: userId })

    if (!stats) {
      stats = await UserStats.create({ user: userId })
    }

    stats.totalMinutesRead += session.duration

    const lastDate = stats.lastReadingDate
      ? new Date(stats.lastReadingDate).setHours(0, 0, 0, 0)
      : null

    const todayDate = new Date().setHours(0, 0, 0, 0)

    if (lastDate === todayDate) {
      stats.todayReadingMinutes += session.duration
    } else {
      stats.todayReadingMinutes = session.duration
    }

    stats.lastReadingDate = new Date()

    if (stats.todayReadingMinutes >= stats.dailyReadingGoal) {
      stats.currentStreak += 1

      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak
      }
    }

    await stats.save()

    res.json(session)
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

export const getStatistics = async (req, res) => {
  try {
    const userId = req.user.id

    const [userStats, completedBooks, currentlyReading] = await Promise.all([
      UserStats.findOne({ user: userId }).lean(),

      Book.countDocuments({
        uploadedBy: userId,
        status: 'completed',
      }),

      Book.countDocuments({
        uploadedBy: userId,
        status: 'reading',
      }),
    ])

    res.status(200).json({
      dailyGoal: userStats?.dailyReadingGoal || 30,
      todayReadingMinutes: userStats?.todayReadingMinutes || 0,
      totalHoursRead: Number(
        ((userStats?.totalMinutesRead || 0) / 60).toFixed(1),
      ),
      currentStreak: userStats?.currentStreak || 0,
      bestStreak: userStats?.bestStreak || 0,
      completedBooks,
      currentlyReading,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message,
    })
  }
}
