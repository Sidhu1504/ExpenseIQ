const db = require('../config/db');
const { matchCategoryByRules } = require('./rule.controller'); // Import the rule engine matcher

exports.addTransaction = async (req, res) => {
    try {
        const { amount, type, merchant_name, date, notes, category_id } = req.body;
        const userId = req.user.id;

        // Smart Logic: If no category_id is explicitly sent, evaluate the merchant name or notes against the rule engine
        let finalCategoryId = category_id;
        if (!finalCategoryId) {
            const searchString = `${merchant_name || ''} ${notes || ''}`;
            finalCategoryId = await matchCategoryByRules(userId, searchString);
        }

        const newTx = await db.query(
            `INSERT INTO transactions (user_id, wallet_id, category_id, amount, type, merchant_name, date, notes) 
             VALUES ($1, null, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, finalCategoryId, amount, type, merchant_name, date, notes]
        );

        res.status(201).json({
            message: 'Transaction processed successfully',
            auto_categorized: !category_id && !!finalCategoryId,
            transaction: newTx.rows[0]
        });
    } catch (error) {
        console.error('Transaction Error:', error);
        res.status(500).json({ error: 'Failed to process transaction' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const txs = await db.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
            [userId]
        );
        res.status(200).json(txs.rows);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
