const db = require('../config/db');
const nodemailer = require('nodemailer');

// 📧 FREE SMTP EMAIL ENGINE CONFIGURATION
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_GMAIL@gmail.com',     // <-- Put your Gmail here
        pass: 'YOUR_APP_PASSWORD'         // <-- Put your 16-digit App Password here
    }
});

const sendAlertEmail = async (toEmail, subject, text) => {
    try {
        await transporter.sendMail({ from: '"ExpenseIQ Alerts" <YOUR_GMAIL@gmail.com>', to: toEmail, subject, text });
        console.log(`✅ Alert Email successfully dispatched to ${toEmail}`);
    } catch (error) { console.error("❌ Email dispatch failed:", error); }
};

// 1. Transaction Portal & CUMULATIVE Alerting Engine
exports.processMockPayment = async (req, res) => {
    try {
        const { amount, recipient, wallet_id, category_id } = req.body;
        const userId = req.user.id;
        const numericAmount = parseFloat(amount);

        // 1. Record the Transaction
        const paymentTx = await db.query(
            `INSERT INTO transactions (user_id, wallet_id, category_id, amount, type, merchant_name, date, notes) 
             VALUES ($1, $2, $3, $4, 'expense', $5, CURRENT_TIMESTAMP, 'Executed via System Gateway') RETURNING *`,
            [userId, wallet_id, category_id, numericAmount, recipient]
        );

        const alerts = [];

        // 2. CUMULATIVE GLOBAL MONTHLY MATH CHECK
        const currentMonthSpend = await db.query(
            `SELECT SUM(amount) as total FROM transactions WHERE user_id = $1 AND type = 'expense' AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
            [userId]
        );
        const totalSpentThisMonth = parseFloat(currentMonthSpend.rows[0].total || 0);

        // Check if a global budget exists for this user
        const globalBudgetCheck = await db.query(`SELECT * FROM budgets WHERE wallet_id = $1 AND category_id IS NULL LIMIT 1`, [userId]);
        
        if (globalBudgetCheck.rows.length > 0) {
            const globalLimit = parseFloat(globalBudgetCheck.rows[0].limit_amount);
            if (totalSpentThisMonth >= globalLimit) {
                alerts.push(`🚨 GLOBAL BUDGET BREACHED: You have spent ₹${totalSpentThisMonth} this month, exceeding your limit of ₹${globalLimit}!`);
            } else if (totalSpentThisMonth >= (globalLimit * 0.9)) {
                alerts.push(`⚠️ WARNING: You have used ${Math.round((totalSpentThisMonth/globalLimit)*100)}% of your monthly global limit.`);
            }
        }

        // 📧 DISPATCH REAL EMAIL IF ALERTS TRIGGERED
        if (alerts.length > 0) {
            const userRes = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length > 0) {
                sendAlertEmail(userRes.rows[0].email, "⚠️ ExpenseIQ: Cumulative Budget Alert Triggered", alerts.join('\n\n'));
            }
        }

        res.status(201).json({ status: "Success", transaction: paymentTx.rows[0], system_alerts: alerts });
    } catch (error) {
        console.error("Transaction failure:", error);
        res.status(500).json({ error: "Transaction routing dropped." });
    }
};

// 2. Budget Matrix Allocations Manager (Updated for Global Budgets)
exports.createBudget = async (req, res) => {
    try {
        const { category_id, limit_amount, alert_threshold_percent } = req.body;
        // If category_id is missing/empty, it saves as a GLOBAL budget (NULL)
        const newBudget = await db.query(
            `INSERT INTO budgets (wallet_id, category_id, limit_amount, alert_threshold_percent, month_year) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`,
            [req.user.id, category_id || null, limit_amount, alert_threshold_percent || 80]
        );
        res.status(201).json({ message: "Budget policy mapped.", budget: newBudget.rows[0] });
    } catch (error) { res.status(500).json({ error: "Failed to map budget configuration." }); }
};

// 3. Export Engine
exports.exportLedgerData = async (req, res) => {
    try {
        const transactions = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
        res.status(200).json({ export_timestamp: new Date().toISOString(), schema_version: "18.4-LTS", ledger: { transactions: transactions.rows } });
    } catch (error) { res.status(500).json({ error: "Data portability error." }); }
};

// 4. Operator Profile
exports.getProfile = async (req, res) => {
    try {
        const userRes = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
        const statsRes = await db.query(`SELECT COUNT(id) as total_entries, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income FROM transactions WHERE user_id = $1`, [req.user.id]);
        res.status(200).json({ user: userRes.rows[0], ledger_stats: { entries: parseInt(statsRes.rows[0]?.total_entries || 0), expenses: parseFloat(statsRes.rows[0]?.total_expense || 0), income: parseFloat(statsRes.rows[0]?.total_income || 0) } });
    } catch (error) { res.status(500).json({ error: "Failed to compile profile." }); }
};

// 5. Subs Engine
exports.getSubscriptions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM subscriptions WHERE user_id = $1', [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) { res.status(500).json({ error: "Failed to fetch subscriptions" }); }
};

// 6. Goals Engine
exports.getGoals = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM goals WHERE user_id = $1', [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) { res.status(500).json({ error: "Failed to fetch goals" }); }
};

exports.createSubscription = async (req, res) => {
    try {
        const { name, amount, cycle, next_date } = req.body;
        const newSub = await db.query(`INSERT INTO subscriptions (user_id, name, amount, cycle, next_date, status) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`, [req.user.id, name, amount, cycle, next_date]);
        res.status(201).json(newSub.rows[0]);
    } catch (error) { res.status(500).json({ error: "Failed to create subscription" }); }
};

exports.createGoal = async (req, res) => {
    try {
        const { name, target_amount, current_amount, deadline } = req.body;
        const newGoal = await db.query(`INSERT INTO goals (user_id, name, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.user.id, name, target_amount, current_amount, deadline]);
        res.status(201).json(newGoal.rows[0]);
    } catch (error) { res.status(500).json({ error: "Failed to create goal" }); }
};

// 🚀 7. NEW SPLIT EXPENSE ENGINE
exports.getSplits = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM splits WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) { res.status(500).json({ error: "Failed to fetch split entries" }); }
};

exports.createSplit = async (req, res) => {
    try {
        const { friend_name, description, total_amount, amount_owed } = req.body;
        const newSplit = await db.query(
            `INSERT INTO splits (user_id, friend_name, description, total_amount, amount_owed, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
            [req.user.id, friend_name, description, total_amount, amount_owed]
        );
        res.status(201).json(newSplit.rows[0]);
    } catch (error) { res.status(500).json({ error: "Failed to record split transaction" }); }
};

exports.settleSplit = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`UPDATE splits SET status = 'settled' WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
        res.status(200).json({ message: "Split settled successfully" });
    } catch (error) { res.status(500).json({ error: "Failed to settle split" }); }
};

// 9. BULK CSV INGESTION ENGINE
exports.bulkImportTransactions = async (req, res) => {
    try {
        const { transactions } = req.body;
        if (!transactions || !transactions.length) return res.status(400).json({ error: "No payload." });

        let importedCount = 0;
        for (const tx of transactions) {
            await db.query(
                `INSERT INTO transactions (user_id, amount, type, merchant_name, date, notes)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [req.user.id, parseFloat(tx.amount), tx.type.toLowerCase(), tx.merchant, tx.date, tx.notes || "CSV Bulk Import"]
            );
            importedCount++;
        }

        // Log this massive action into the Security Audit Table
        await db.query(`INSERT INTO audit_logs (user_id, action, ip_address, device) VALUES ($1, $2, $3, $4)`,
            [req.user.id, `Bulk Ingestion: ${importedCount} rows`, req.ip || 'Unknown IP', req.headers['user-agent'] || 'Unknown Device']
        );

        res.status(201).json({ message: `Successfully parsed and wrote ${importedCount} rows to ledger.` });
    } catch (error) {
        console.error("Bulk Import Failed:", error);
        res.status(500).json({ error: "CSV pipeline failure." });
    }
};

// 10. SECURITY AUDIT LOG VIEWER
exports.getAuditLogs = async (req, res) => {
    try {
        // Automatically log a "Session Verified" event so you can see it working immediately
        await db.query(`INSERT INTO audit_logs (user_id, action, ip_address, device) VALUES ($1, 'Session Verification & Profile Access', $2, $3)`,
            [req.user.id, req.ip || 'Unknown IP', req.headers['user-agent'] || 'Unknown Device']
        );

        const logs = await db.query('SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [req.user.id]);
        res.status(200).json(logs.rows);
    } catch (error) {
        res.status(500).json({ error: "Audit Matrix offline." });
    }
};

// 11. MULTI-TENANT: SHARE WALLET ENGINE
exports.shareWallet = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Check if the invited user exists on ExpenseIQ
        const friend = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
        if (friend.rows.length === 0) return res.status(404).json({ error: "User not found on ExpenseIQ. Have them register first." });

        // 2. Find your primary wallet
        const myWallet = await db.query('SELECT id FROM wallets WHERE owner_id = $1 LIMIT 1', [req.user.id]);
        if (myWallet.rows.length === 0) return res.status(404).json({ error: "Primary wallet missing." });

        // 3. Bind the friend to your wallet in the wallet_members junction table
        await db.query(
            `INSERT INTO wallet_members (wallet_id, user_id, permissions) VALUES ($1, $2, 'editor') ON CONFLICT DO NOTHING`,
            [myWallet.rows[0].id, friend.rows[0].id]
        );

        // 4. Update wallet status
        await db.query('UPDATE wallets SET is_shared = TRUE WHERE id = $1', [myWallet.rows[0].id]);

        // Log to security audit
        await db.query(`INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)`, [req.user.id, `Shared wallet access with ${email}`]);

        res.status(200).json({ message: `Success! ${friend.rows[0].name} now has multi-tenant access to your ledger.` });
    } catch (error) {
        console.error("Share Wallet Error:", error);
        res.status(500).json({ error: "Failed to establish multi-tenant connection." });
    }
};

const { authenticator } = require('otplib');
const qrcode = require('qrcode');

// 12. 2FA: Generate Google Authenticator QR Code
exports.generate2FA = async (req, res) => {
    try {
        const user = await db.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
        const secret = authenticator.generateSecret();
        // Create the URI that the Google Authenticator app scans
        const otpauth = authenticator.keyuri(user.rows[0].email, 'ExpenseIQ-Enterprise', secret);

        // Generate a visual QR Code Image
        const qrCodeUrl = await qrcode.toDataURL(otpauth);

        // Save the secret temporarily to the user's database row
        await db.query('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [secret, req.user.id]);

        res.status(200).json({ qrCodeUrl, secret });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate 2FA cipher." });
    }
};

// 13. 2FA: Verify the Code
exports.verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await db.query('SELECT two_factor_secret FROM users WHERE id = $1', [req.user.id]);

        // Check if the 6-digit code matches the secret
        const isValid = authenticator.check(token, user.rows[0].two_factor_secret);

        if (isValid) {
            await db.query(`INSERT INTO audit_logs (user_id, action) VALUES ($1, '2FA Successfully Activated')`, [req.user.id]);
            res.status(200).json({ message: "2FA Verified and Locked." });
        } else {
            res.status(400).json({ error: "Invalid 6-digit code." });
        }
    } catch (error) {
        res.status(500).json({ error: "2FA Verification failed." });
    }
};
