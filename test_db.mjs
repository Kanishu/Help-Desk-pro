import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT 1 as val');
  console.log('DB connected:', res.rows[0]);
  
  // Add INSERT policy for users
  try {
    await client.query(`
      CREATE POLICY "Users can insert their own profile"
      ON users FOR INSERT
      WITH CHECK (id = auth.uid());
    `);
    console.log('Policy created for users');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Policy already exists');
    } else {
      console.error('Error creating policy users:', e.message);
    }
  }

  // Check if organizations has insert policy
  try {
    await client.query(`
      CREATE POLICY "organizations_insert_any"
      ON public.organizations FOR INSERT
      WITH CHECK (true);
    `);
    console.log('Policy created for organizations');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Org Policy already exists');
    } else {
      console.error('Error creating policy organizations:', e.message);
    }
  }

  // Enable Realtime
  try {
    await client.query(`
      ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
      ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;
    `);
    console.log('Realtime enabled for tables');
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('is already in publication')) {
      console.log('Realtime already enabled or publication exists');
    } else {
      console.error('Error enabling realtime:', e.message);
    }
  }

  await client.end();
}
run();
