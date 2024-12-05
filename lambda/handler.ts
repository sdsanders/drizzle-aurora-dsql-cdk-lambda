import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Client } from 'pg';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { text, pgTable, uuid } from 'drizzle-orm/pg-core';

const owner = pgTable('owner', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  telephone: text('telephone'),
});

export const handler = async () => {
  const clusterEndpoint = 'YOUR_CLUSTER_ENDPOINT';
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

    await client.connect();

    const db = drizzle(client, { schema: { owner } });
    await db
      .insert(owner)
      .values({ name: 'John Doe', city: 'Anytown', telephone: '555-555-1900' });
    const owners = await db.select().from(owner);

    await db.delete(owner).where(eq(owner.name, 'John Doe'));

    return owners;
  } catch (error) {
    console.error(error);
    return error;
  } finally {
    client?.end();
  }
};
