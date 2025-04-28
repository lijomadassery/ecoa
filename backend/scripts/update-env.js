#!/usr/bin/env node

/**
 * This script updates the DATABASE_URL in .env to add connection pooling parameters
 */

const fs = require('fs');
const path = require('path');

// Path to .env file
const envFilePath = path.resolve(__dirname, '../.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('.env file not found at:', envFilePath);
  process.exit(1);
}

// Read .env file
let envContent = fs.readFileSync(envFilePath, 'utf-8');

// Parse DATABASE_URL
const databaseUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
if (!databaseUrlMatch) {
  console.error('DATABASE_URL not found in .env file');
  process.exit(1);
}

const databaseUrl = databaseUrlMatch[1];

// Check if connection pooling parameters already exist
if (databaseUrl.includes('connection_limit=')) {
  console.log('Connection pooling already configured in DATABASE_URL');
  process.exit(0);
}

// Add connection pooling parameters
let updatedDatabaseUrl;
if (databaseUrl.includes('?')) {
  // If URL already has query parameters, add pooling parameters
  updatedDatabaseUrl = `${databaseUrl}&connection_limit=5&pool_timeout=30`;
} else {
  // If URL doesn't have query parameters, add them
  updatedDatabaseUrl = `${databaseUrl}?connection_limit=5&pool_timeout=30`;
}

// Replace DATABASE_URL in .env content
const updatedEnvContent = envContent.replace(
  /DATABASE_URL=["']?(.*?)["']?$/m,
  `DATABASE_URL=${updatedDatabaseUrl}`
);

// Write updated content back to .env file
fs.writeFileSync(envFilePath, updatedEnvContent);

console.log('Updated DATABASE_URL with connection pooling parameters:');
console.log(updatedDatabaseUrl);
console.log('Remember to restart your server for changes to take effect.'); 