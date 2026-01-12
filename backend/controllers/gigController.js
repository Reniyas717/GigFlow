import Gig from '../models/Gig.js';

export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || budget === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user.userId,
      status: 'open'
    });

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGigs = async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = { status: 'open' };
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};