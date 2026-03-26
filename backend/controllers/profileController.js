const db = require('../db');

exports.getProfile = async (req, res) => {
  try {
    const [userRows] = await db.query('SELECT * FROM user_profile LIMIT 1');
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const userId = userRows[0].id;
    
    const [educationRows] = await db.query('SELECT * FROM education WHERE user_id = ? ORDER BY start_year DESC', [userId]);
    const [skillsRows] = await db.query('SELECT * FROM skills WHERE user_id = ?', [userId]);
    const [achievementsRows] = await db.query('SELECT * FROM achievements WHERE user_id = ? ORDER BY year DESC', [userId]);

    const profileData = {
      user: userRows[0],
      education: educationRows,
      skills: skillsRows,
      achievements: achievementsRows
    };

    res.json(profileData);
  } catch (err) {
    console.error('Error fetching profile from db:', err);
    res.status(500).json({ error: 'Internal Server Error fetching profile' });
  }
};
