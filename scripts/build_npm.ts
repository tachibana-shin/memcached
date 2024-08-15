import { build, emptyDir } from "@deno/dnt"
import pkg from "../deno.json" with { type: "json" }

await emptyDir("./npm")

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  typeCheck: false,
  skipNpmInstall: true,
  packageManager: "bun",
  shims: {
    deno: true,
  },
  package: {
    // package.json properties
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/tachibana-shin/memcached.git",
    },
    bugs: {
      url: "https://github.com/tachibana-shin/memcached/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE")
    Deno.copyFileSync("README.md", "npm/README.md")
  },
})
