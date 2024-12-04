import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';

export const handler = async () => {
  const clusterEndpoint = 'oqabtu7fln6kh65nvyj62cbh3e.dsql.us-east-1.on.aws';
  let client;
  const region = 'us-east-1';
  try {
    // The token expiration time is optional, and the default value 900 seconds
    const signer = new DsqlSigner({
      hostname: clusterEndpoint,
      region,
    });
    const token = await signer.getDbConnectAdminAuthToken();
    client = new Client({
      host: clusterEndpoint,
      user: 'admin',
      password: token,
      database: 'postgres',
      port: 5432,
      ssl: true,
    });

    // Connect
    await client.connect();

    // Create a new table
    await client.query(`CREATE TABLE IF NOT EXISTS owner (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(30) NOT NULL,
      city VARCHAR(80) NOT NULL,
      telephone VARCHAR(20)
    )`);

    // Insert some data
    await client.query(
      'INSERT INTO owner(name, city, telephone) VALUES($1, $2, $3)',
      ['John Doe', 'Anytown', '555-555-1900']
    );

    // Check that data is inserted by reading it back
    const result = await client.query(
      "SELECT id, city FROM owner where name='John Doe'"
    );

    await client.query("DELETE FROM owner where name='John Doe'");

    return result;
  } catch (error) {
    console.error(error);
    return;
  } finally {
    client?.end();
  }
};
