import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

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
    const db = drizzle({ client });
    const result = await db.execute('select 1');

    return result;
  } catch (error) {
    console.error(error);
    return;
  } finally {
    client?.end();
  }
};
