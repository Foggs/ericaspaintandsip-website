import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
    {
      slug: "media",
      upload: true,
      fields: [],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "fallback-secret-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI ?? "",
  }),
});
