const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const transactionRoutes = require('./src/routes/transaction.routes');
const ruleRoutes = require('./src/routes/rule.routes'); 
const ocrRoutes = require('./src/routes/ocr.routes'); 

const featureRoutes = express.Router();
const featureController = require('./src/controllers/feature.controller');
const verifyToken = require('./src/middlewares/auth.middleware');

featureRoutes.use(verifyToken);
featureRoutes.post('/pay', featureController.processMockPayment);
featureRoutes.post('/budgets', featureController.createBudget);
featureRoutes.get('/export', featureController.exportLedgerData);
featureRoutes.get('/profile', featureController.getProfile);

// 🚀 NEW ROUTES ADDED HERE
featureRoutes.get('/subscriptions', featureController.getSubscriptions);
featureRoutes.get('/goals', featureController.getGoals);
featureRoutes.post('/subscriptions', featureController.createSubscription);
featureRoutes.post('/goals', featureController.createGoal);
featureRoutes.get('/splits', featureController.getSplits);
featureRoutes.post('/splits', featureController.createSplit);
featureRoutes.put('/splits/:id/settle', featureController.settleSplit);
featureRoutes.post('/import/bulk', featureController.bulkImportTransactions);
featureRoutes.get('/audit/logs', featureController.getAuditLogs);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rules', ruleRoutes); 
app.use('/api/ocr', ocrRoutes); 
app.use('/api/features', featureRoutes);

app.get('/api/health', async (req, res) => {
    try {
        const dbRes = await db.query('SELECT NOW()');
        res.status(200).json({ status: 'Healthy', db_time: dbRes.rows[0].now });
    } catch (error) {
        res.status(500).json({ status: 'Database failed', error: error.message });
    }
});

setInterval(async () => {
    try {
        // Cron Daemon Active
    } catch (cronError) {
        console.error("Cron cycle skipped:", cronError);
    }
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Advanced Multi-Functional Engine running on port ${PORT}`));
