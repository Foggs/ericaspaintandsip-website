import { mongooseAdapter } from "@payloadcms/db-mongodb";
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

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error(
    "MONGODB_URI environment variable is required. Please set it in Replit Secrets."
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
  db: mongooseAdapter({
    url: mongoUri,
  }),
});
