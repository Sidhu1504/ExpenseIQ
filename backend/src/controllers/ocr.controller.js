const Tesseract = require('tesseract.js');
const { matchCategoryByRules } = require('./rule.controller');

exports.scanReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No receipt image provided.' });
        }

        // 1. Run OCR directly on the memory buffer (no saving to disk required)
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
        
        // 2. Extract specific data points using Regex
        // Looks for currency patterns like 45.00, 1,200.50
        const amountMatch = text.match(/[\d,]+[.]\d{2}/); 
        const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '')) : null;

        // Looks for dates like 12/05/2026 or 2026-05-12
        const dateMatch = text.match(/\d{2,4}[\/\-]\d{2}[\/\-]\d{2,4}/);
        const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

        // 3. Pass the raw text through our Smart Rule Engine
        const userId = req.user.id;
        const suggestedCategoryId = await matchCategoryByRules(userId, text);

        res.status(200).json({
            message: 'Receipt analyzed successfully',
            extracted_data: {
                amount: amount,
                date: date,
                suggested_category_id: suggestedCategoryId,
                raw_text_snippet: text.substring(0, 200).replace(/\n/g, ' ') + '...' // Return a snippet for debugging
            }
        });

    } catch (error) {
        console.error('OCR Processing Error:', error);
        res.status(500).json({ error: 'Failed to process receipt image' });
    }
};
