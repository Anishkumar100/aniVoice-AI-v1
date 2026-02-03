import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const seedAdmin = async () => {
    try {
        // 1. Connect to DB (since this runs as a standalone script)
        await mongoose.connect(process.env.MONGO_URI);

        const adminEmail = process.env.ADMIN_EMAIL ;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // 2. Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await Admin.create({
                name: 'AK MASTER',
                email: adminEmail,
                password: hashedPassword
            });
            console.log("✅ Admin Seeding Successful!");
        } else {
            console.log("ℹ️ Admin already exists. Skipping seeder.");
        }

        process.exit();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedAdmin();