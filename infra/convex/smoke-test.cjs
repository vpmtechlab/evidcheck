// Smoke test: runs a sandbox verification against the self-hosted backend
// over the public HTTPS endpoint (nginx -> backend action runtime).
// Usage: node infra/convex/smoke-test.cjs [baseUrl]
const { ConvexHttpClient } = require("convex/browser");

const baseUrl = process.argv[2] || "https://convex-api.evidcheck.com";
const args = require("./smoke-args.json");

async function main() {
  const client = new ConvexHttpClient(baseUrl);
  const started = Date.now();
  const result = await client.action("verifications:runVerification", args);
  console.log("OK in " + (Date.now() - started) + "ms");
  console.log("jobId: " + result.jobId);
  console.log("resultStatus: " + result.resultStatus);
  console.log("payloadKeys: " + Object.keys(result.data || {}).join(","));
}

main().catch((e) => {
  console.error("SMOKE_FAIL: " + (e.message || e));
  process.exit(1);
});
