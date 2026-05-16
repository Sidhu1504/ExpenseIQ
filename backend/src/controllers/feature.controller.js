const db = require('../config/db');
const nodemailer = require('nodemailer');

// 📧 FREE SMTP EMAIL ENGINE CONFIGURATION
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'botesidhant@gmail.com',     // <-- Put your Gmail here
        pass: 'qrgc sctr ltgl pozc'         // <-- Put your 16-digit Gmail App Password here
    }
});

const sendAlertEmail = async (toEmail, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"ExpenseIQ Alerts" <YOUR_GMAIL@gmail.com>', // <-- Put your Gmail here
            to: toEmail,
            subject: subject,
            text: text
        });
        console.log(`✅ Alert Email successfully dispatched to ${toEmail}`);
    } catch (error) {
        console.error("❌ Email dispatch failed:", error);
    }
};


// 1. Mock Payment Portal & Gateway Alerting Engine
exports.processMockPayment = async (req, res) => {
    try {
        const { amount, recipient, wallet_id, category_id } = req.body;
        const userId = req.user.id;

        const paymentTx = await db.query(
            `INSERT INTO transactions (user_id, wallet_id, category_id, amount, type, merchant_name, date, notes) 
             VALUES ($1, $2, $3, $4, 'expense', $5, CURRENT_TIMESTAMP, 'Executed via Mock Gateway Portal') RETURNING *`,
            [userId, wallet_id, category_id, amount, recipient]
        );

        const alerts = [];
        if (amount > 10000) alerts.push(`CRITICAL SPIKE: High-value transaction processed: ₹${amount} to ${recipient}`);

        if (category_id) {
            const budgetCheck = await db.query(
                `SELECT b.*, c.name as category_name, COALESCE(SUM(t.amount), 0) as total_spent
                 FROM budgets b JOIN categories c ON c.id = b.category_id
                 LEFT JOIN transactions t ON t.category_id = b.category_id AND t.user_id = b.wallet_id
                 WHERE b.category_id = $1 AND b.wallet_id = $2 GROUP BY b.id, c.name`,
                [category_id, userId]
            );

            if (budgetCheck.rows.length > 0) {
                const budget = budgetCheck.rows[0];
                const limit = parseFloat(budget.limit_amount);
                const currentSpent = parseFloat(budget.total_spent) + parseFloat(amount);
                const threshold = (budget.alert_threshold_percent / 100) * limit;

                if (currentSpent >= limit) alerts.push(`🚨 BUDGET BREACHED: Category '${budget.category_name}' limit exceeded! Limit: ₹${limit}, Spent: ₹${currentSpent}`);
                else if (currentSpent >= threshold) alerts.push(`⚠️ BUDGET WARNING: Category '${budget.category_name}' is at ${Math.round((currentSpent/limit)*100)}% capacity.`);
            }
        }

        // 📧 IF ALERTS EXIST, FETCH USER EMAIL AND SEND REAL NOTIFICATION
        if (alerts.length > 0) {
            const userRes = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length > 0) {
                sendAlertEmail(userRes.rows[0].email, "⚠️ ExpenseIQ: Budget Alert Triggered", alerts.join('\n\n'));
            }
        }

        res.status(201).json({ status: "Success", transaction: paymentTx.rows[0], system_alerts: alerts });
    } catch (error) {
        console.error("Payment failure:", error);
        res.status(500).json({ error: "Gateway transaction routing dropped." });
    }
};

// 2. Budget Matrix Allocations Manager
exports.createBudget = async (req, res) => {
    try {
        const { category_id, limit_amount, alert_threshold_percent } = req.body;
        const newBudget = await db.query(
            `INSERT INTO budgets (wallet_id, category_id, limit_amount, alert_threshold_percent, month_year) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`,
            [req.user.id, category_id, limit_amount, alert_threshold_percent || 80]
        );
        res.status(201).json({ message: "Budget policy mapped.", budget: newBudget.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Failed to map budget configuration profile." });
    }
};

// 3. Financial Ledger Data Portability
exports.exportLedgerData = async (req, res) => {
    try {
        const transactions = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
        res.status(200).json({ export_timestamp: new Date().toISOString(), schema_version: "18.4-LTS", ledger: { transactions: transactions.rows } });
    } catch (error) {
        res.status(500).json({ error: "Data portability error." });
    }
};

// 4. Operator Profile & Ledger Statistics
exports.getProfile = async (req, res) => {
    try {
        const userRes = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
        const statsRes = await db.query(`
            SELECT COUNT(id) as total_entries, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income
            FROM transactions WHERE user_id = $1`, [req.user.id]);
        res.status(200).json({ user: userRes.rows[0], ledger_stats: { entries: parseInt(statsRes.rows[0]?.total_entries || 0), expenses: parseFloat(statsRes.rows[0]?.total_expense || 0), income: parseFloat(statsRes.rows[0]?.total_income || 0) } });
    } catch (error) {
        res.status(500).json({ error: "Failed to compile profile." });
    }
};

// 5. Subscription Engine (READ)
exports.getSubscriptions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM subscriptions WHERE user_id = $1', [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
};

// 6. Savings Goals Engine (READ)
exports.getGoals = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM goals WHERE user_id = $1', [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch goals" });
    }
};

// 7. Write New Subscription to Database
exports.createSubscription = async (req, res) => {
    try {
        const { name, amount, cycle, next_date } = req.body;
        const newSub = await db.query(
            `INSERT INTO subscriptions (user_id, name, amount, cycle, next_date, status) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
            [req.user.id, name, amount, cycle, next_date]
        );
        res.status(201).json(newSub.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to create subscription" });
    }
};

// 8. Write New Goal & ALERT LOGIC
exports.createGoal = async (req, res) => {
    try {
        const { name, target_amount, current_amount, deadline } = req.body;
        const newGoal = await db.query(
            `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, name, target_amount, current_amount, deadline]
        );

        // 📧 IF GOAL IS INITIATED CLOSE TO TARGET, SEND ALERT
        const percentage = (parseFloat(current_amount) / parseFloat(target_amount)) * 100;
        if (percentage >= 90) {
            const userRes = await db.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
            if (userRes.rows.length > 0) {
                sendAlertEmail(userRes.rows[0].email, "🎯 ExpenseIQ: Goal Reached!", `Congratulations! Your savings goal for "${name}" has reached ${percentage.toFixed(1)}% of its target.`);
            }
        }

        res.status(201).json(newGoal.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to create goal" });
    }
};
