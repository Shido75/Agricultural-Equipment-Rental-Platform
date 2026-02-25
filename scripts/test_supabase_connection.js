const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing URL or Key in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('Pinging Supabase...');
        const start = Date.now();

        // Simple fetch to see if API is reachable
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        const time = Date.now() - start;
        console.log(`Ping complete in ${time}ms.`);
        console.log('HTTP Status:', response.status);
        console.log('HTTP Status Text:', response.statusText);

        if (!response.ok) {
            console.error('Failed to connect to Supabase API. The project might be paused or the URL is incorrect.');
        } else {
            console.log('Successfully connected to Supabase API!');
        }
    } catch (error) {
        console.error('\nNETWORK ERROR: Failed to reach Supabase.');
        console.error('This usually means your Supabase URL is incorrect, your project is paused/deleted, or you have no internet connection.');
        console.error('\nError details:', error.message);
    }
}

testConnection();
