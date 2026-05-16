const db = require('../config/db');

// Create a new categorization rule
exports.createRule = async (req, res) => {
    try {
        const { keyword, assign_category_id } = req.body;
        const userId = req.user.id;

        const newRule = await db.query(
            `INSERT INTO automation_rules (user_id, keyword, assign_category_id) 
             VALUES ($1, LOWER($2), $3) RETURNING *`,
            [userId, keyword, assign_category_id]
        );

        res.status(201).json({ message: 'Automation rule created', rule: newRule.rows[0] });
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ error: 'Failed to create automation rule' });
    }
};

// Internal utility function used during transaction creation
exports.matchCategoryByRules = async (userId, sampleText) => {
    try {
        if (!sampleText) return null;
        
        // Fetch active rules for the user
        const rulesResult = await db.query(
            'SELECT keyword, assign_category_id FROM automation_rules WHERE user_id = $1 AND is_active = true',
            [userId]
        );

        const normalizedText = sampleText.toLowerCase();

        // Loop through rules to find a keyword match
        for (const rule of rulesResult.rows) {
            if (normalizedText.includes(rule.keyword)) {
                return rule.assign_category_id; // Return the matched category UUID
            }
        }
        return null; // No match found
    } catch (error) {
        console.error('Rule matching failed:', error);
        return null;
    }
};
