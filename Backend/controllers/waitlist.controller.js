import WaitList from './../models/Waitlist.js'

// Add user to waitlist
export const addToWaitlist = async (req, res) => {
  try {
    const { email } = req.body
    const existingUser = await WaitList.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in waitlist' })
    }
    const newUser = new WaitList({ email })
    await newUser.save()
    res
      .status(201)
      .json({ message: 'Successfully added to waitlist', user: newUser })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error adding to waitlist', error: error.message })
  }
}

// Get all waitlist users
export const getWaitlistUsers = async (req, res) => {
  try {
    const users = await WaitList.find()
    res.status(200).json(users)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching waitlist users', error: error.message })
  }
}
