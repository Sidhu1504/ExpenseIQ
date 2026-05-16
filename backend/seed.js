const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log('🌱 Starting Database Seeding...');

        // 1. Clean existing test data
        await db.query('TRUNCATE users, categories, automation_rules, transactions CASCADE');

        // 2. Insert Test User
        const passwordHash = await bcrypt.hash('password123', 10);
        const userRes = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES ('Sidhant', 'sid@test.com', $1, 'user') RETURNING id`,
            [passwordHash]
        );
        const userId = userRes.rows[0].id;
        console.log(`👤 Created Test User ID: ${userId}`);

        // 3. Insert "Transport" Category
        const catRes = await db.query(
            `INSERT INTO categories (name, type, icon, color) 
             VALUES ('Transport', 'expense', 'car', 'blue') RETURNING id`
        );
        const categoryId = catRes.rows[0].id;
        console.log(`🗂️ Created 'Transport' Category ID: ${categoryId}`);

        // 4. Insert Automation Rule for 'uber'
        const ruleRes = await db.query(
            `INSERT INTO automation_rules (user_id, keyword, assign_category_id) 
             VALUES ($1, 'uber', $2) RETURNING *`,
            [userId, categoryId]
        );
        console.log(`🤖 Automated Rule Active: Keyword 'uber' -> Category ID: ${categoryId}`);
        console.log('\n✅ Seeding complete! You are ready to test.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
