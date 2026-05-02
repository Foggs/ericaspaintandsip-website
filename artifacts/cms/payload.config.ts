import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const payloadSecret = process.env.PAYLOAD_SECRET;
if (!payloadSecret) {
  throw new Error(
    "PAYLOAD_SECRET environment variable is required. Please set it in Replit Secrets."
  );
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is required. Replit's built-in PostgreSQL database provides this automatically."
  );
}

export default buildConfig({
  admin: {
    user: "users",
  },
  collections: [
    {
      slug: "users",
      auth: true,
      fields: [],
    },
  ],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    push: process.env.NODE_ENV !== "production",
  }),
});
