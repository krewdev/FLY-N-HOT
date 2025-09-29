#!/usr/bin/env node

// Script to generate secure secrets for deployment

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for FLY-IN-HIGH deployment\n');

// Generate JWT Secret (32 bytes = 256 bits)
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log(`(Length: ${jwtSecret.length} characters)\n`);

// Generate Admin Secret (16 bytes = 128 bits)
const adminSecret = crypto.randomBytes(16).toString('base64');
console.log('ADMIN_SECRET:');
console.log(adminSecret);
console.log(`(Length: ${adminSecret.length} characters)\n`);

console.log('📋 Copy these values to your Vercel environment variables.');
console.log('⚠️  Keep these secrets safe and never commit them to Git!\n');

console.log('Example .env file:');
console.log('```');
console.log('NODE_ENV=production');
console.log('DATABASE_URL=your_database_connection_string');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ADMIN_SECRET=${adminSecret}`);
console.log('```');