import { withPayload } from "@payloadcms/next/withPayload";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monacoStub = path.resolve(__dirname, "src/monaco-stub.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    // @monaco-editor/react is browser-only but Payload's CodeEditor component
    // (which is a 'use client' component) still runs on the server during SSR
    // for the initial HTML render.  We must replace Monaco in ALL webpack
    // compilations (client + server) so the SSR pass never executes Monaco code
    // in Node.js.  The stub renders null on both server and client; the Payload
    // admin panel still fully loads — it just uses a textarea fallback instead
    // of the rich Monaco code editor until the JS hydrates in the browser.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@monaco-editor\/react/,
        monacoStub
      )
    );
    return config;
  },
};

// devBundleServerPackages: true forces webpack (not native Node require) to
// process payload and all transitive deps so our NormalModuleReplacementPlugin
// can intercept @monaco-editor/react imports inside @payloadcms/ui.
export default withPayload(nextConfig, { devBundleServerPackages: true });
