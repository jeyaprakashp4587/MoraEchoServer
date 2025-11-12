import User from '../models/User.js';

// Update user coins
export const updateCoins = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId; 
    console.log('amount', amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid coin amount' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { amount: amount } },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Coins updated successfully',
      user: updatedUser,
      newAmount: updatedUser.amount,
    });
  } catch (error) {
    console.error('Update coins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Decrease user coins
export const decreaseCoins = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId; 

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid coin amount' });
    }


    const user = await User.findById(userId).select('amount');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.amount < amount) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { amount: -amount } },
      { new: true, select: '-password' }
    );

    res.status(200).json({
      message: 'Coins decreased successfully',
      newAmount: updatedUser.amount,
    });
  } catch (error) {
    console.error('Decrease coins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user coins
export const getUserCoins = async (req, res) => {
  try {
    const userId = req.userId; // From verifyToken middleware

    const user = await User.findById(userId).select('amount');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      amount: user.amount,
    });
  } catch (error) {
    console.error('Get coins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

