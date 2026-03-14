import Book from '../models/Books.js'
import Notes from '../models/Notes.js'

export const createNote = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userId = req.user.id
    const { bookId, content, pageNumber } = req.body

    if (!bookId || !content || typeof pageNumber !== 'number') {
      return res.status(400).json({
        message: 'bookId, content, and valid pageNumber are required',
      })
    }

    // Validate that content is not empty or whitespace
    const trimmedContent = content.trim()
    if (trimmedContent.length === 0) {
      return res.status(400).json({
        message: 'Content cannot be empty or contain only whitespace',
      })
    }

    const checkBook = await Book.findById(bookId)
    if (!checkBook) {
      return res.status(404).json({ message: 'Book not found' })
    }

    const newNote = new Notes({
      book: bookId,
      content: trimmedContent,
      page: pageNumber,
      createdBy: userId,
    })

    const savedNote = await newNote.save()

    return res.status(201).json({
      message: 'Note created successfully',
      note: savedNote,
    })
  } catch (error) {
    return res.status(500).json({
      message: `Error creating note: ${error.message}`,
    })
  }
}

export const deleteNote = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const note = await Notes.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    // Check ownership
    if (note.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Not allowed to delete this note' })
    }

    await note.deleteOne()

    return res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getAllNotes = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userId = req.user.id

    const notes = await Notes.find({ createdBy: userId })
      .populate({
        path: 'book',
        match: { uploadedBy: userId },
        select: 'title author',
      })
      .populate('createdBy')

    const filteredNotes = notes.filter((note) => note.book !== null)

    return res.json(filteredNotes)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getNoteById = async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id)
      .populate('book')
      .populate('createdBy')
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }
    res.json(note)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
