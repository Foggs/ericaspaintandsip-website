// SSR-safe stub for @monaco-editor/react.
// Monaco Editor requires a DOM and cannot run in Node.js.
// This file replaces every import of @monaco-editor/react in all webpack
// compilations so the server-side render of Payload's admin panel never tries
// to execute Monaco in a Node.js context.
//
// The Payload admin UI still loads correctly; the code-editor fields simply
// render nothing until the page hydrates in the browser (acceptable for a
// shell CMS with no custom Code fields).

const stub = () => null;
stub.displayName = "MonacoStub";

export default stub;
export const Editor = stub;
export const DiffEditor = stub;
export const MonacoDiffEditor = stub;

// loader.config / loader.init are called by @monaco-editor/react internals;
// return harmless no-ops so destructuring inside Payload's UI doesn't throw.
export const loader = {
  config: () => {},
  init: () => Promise.resolve({}),
  __getMonacoInstance: () => null,
};

// useMonaco returns an empty object so destructuring like
//   const { config } = useMonaco()
// doesn't throw on the server.
export const useMonaco = () => ({});
