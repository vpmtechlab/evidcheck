import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const http = httpRouter();

/**
 * Public Webhook for Paystack Payment Notifications.
 */
http.route({
  path: "/paystack/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return new Response("No signature provided", { status: 400 });
    }

    const body = await request.text();

    try {
      const result = await ctx.runAction(internal.payments.handleWebhook, {
        body,
        signature,
      });

      if (result.success) {
        return new Response("OK", { status: 200 });
      } else {
        return new Response(result.message || "Webhook processing failed", { status: 400 });
      }
    } catch (error) {
      console.error("Webhook route error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

function extractApiKey(request: Request): string | null {
  const headerKey = request.headers.get("X-API-KEY") || request.headers.get("x-api-key");
  if (headerKey) return headerKey.trim();

  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * PRODUCTION REST API: Initiate Verification
 * POST /v1/verifications
 * Requires Live API Key (evid_live_sk_*). Rejects Test keys.
 */
http.route({
  path: "/v1/verifications",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const apiKey = extractApiKey(request);
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        message: "Missing API key. Provide 'x-api-key' header or 'Authorization: Bearer <key>'." 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (apiKey.startsWith("evid_test_sk_") || apiKey.includes("test")) {
      return new Response(JSON.stringify({ 
        error: "Forbidden", 
        message: "Invalid Key Environment: Test/Sandbox API keys (evid_test_sk_*) cannot be used on the Production endpoint (api.evidcheck.com). Please send requests to the Sandbox endpoint (https://sandbox.evidcheck.com/v1/sandbox/verifications) or use a Live Production key." 
      }), { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const payload = (await request.json()) as { 
        type?: string; 
        service_type?: string; 
        serviceType?: string;
        data?: Record<string, unknown>; 
        entity_data?: Record<string, unknown>; 
        entityData?: Record<string, unknown>;
        webhook_url?: string; 
        webhookUrl?: string;
      };
      
      const result = await ctx.runAction(api.api_actions.verifyAndRun, {
        apiKey,
        serviceType: payload.serviceType || payload.type || payload.service_type || "national_id",
        entityData: payload.entityData || payload.data || payload.entity_data || {},
        webhookUrl: payload.webhookUrl || payload.webhook_url,
        isSandbox: false,
      });

      return new Response(JSON.stringify(result), {
        status: result.status || (result.success ? 201 : 400),
        headers: { "Content-Type": "application/json" }
      });

    } catch (err: unknown) {
      const error = err as Error;
      return new Response(JSON.stringify({ 
        error: "Bad Request", 
        message: "Invalid JSON payload or internal error.",
        details: error.message
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }),
});

/**
 * SANDBOX REST API: Initiate Verification
 * POST /v1/sandbox/verifications
 * Requires Test API Key (evid_test_sk_*). Rejects Live keys. Zero billing.
 */
http.route({
  path: "/v1/sandbox/verifications",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const apiKey = extractApiKey(request);
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        message: "Missing API key. Provide 'x-api-key' header or 'Authorization: Bearer <key>'." 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (apiKey.startsWith("evid_live_sk_")) {
      return new Response(JSON.stringify({ 
        error: "Forbidden", 
        message: "Invalid Key Environment: Live API keys (evid_live_sk_*) cannot be used on the Sandbox endpoint. Please use the Production endpoint (https://api.evidcheck.com/v1/verifications) or use a Test API key." 
      }), { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const payload = (await request.json()) as { 
        type?: string; 
        service_type?: string; 
        serviceType?: string;
        data?: Record<string, unknown>; 
        entity_data?: Record<string, unknown>; 
        entityData?: Record<string, unknown>;
        webhook_url?: string; 
        webhookUrl?: string;
      };
      
      const result = await ctx.runAction(api.api_actions.verifyAndRun, {
        apiKey,
        serviceType: payload.serviceType || payload.type || payload.service_type || "national_id",
        entityData: payload.entityData || payload.data || payload.entity_data || {},
        webhookUrl: payload.webhookUrl || payload.webhook_url,
        isSandbox: true,
      });

      return new Response(JSON.stringify({
        ...result,
        environment: "sandbox",
        notice: "Sandbox verification executed cleanly. Zero money deducted from balance."
      }), {
        status: result.status || (result.success ? 201 : 400),
        headers: { "Content-Type": "application/json" }
      });

    } catch (err: unknown) {
      const error = err as Error;
      return new Response(JSON.stringify({ 
        error: "Bad Request", 
        message: "Invalid JSON payload or sandbox error.",
        details: error.message
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }),
});

/**
 * REST API: Get Paginated Verification Jobs List
 * GET /v1/jobs?page=1&limit=10&status=approved&serviceType=business_registration
 */
http.route({
  path: "/v1/jobs",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const apiKey = extractApiKey(request);
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        message: "Missing API key. Provide 'x-api-key' header or 'Authorization: Bearer <key>'." 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const status = url.searchParams.get("status") || undefined;
    const serviceType = url.searchParams.get("serviceType") || undefined;

    const result = await ctx.runAction(api.api_actions.listJobs, {
      apiKey,
      page,
      limit,
      status,
      serviceType,
    });

    return new Response(JSON.stringify(result), {
      status: result.status,
      headers: { "Content-Type": "application/json" }
    });
  }),
});

/**
 * REST API: Query Wallet Balance
 * GET /v1/balance
 */
http.route({
  path: "/v1/balance",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const apiKey = extractApiKey(request);
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        message: "Missing API key. Provide 'x-api-key' header or 'Authorization: Bearer <key>'." 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await ctx.runAction(api.api_actions.getBalance, {
      apiKey,
    });

    return new Response(JSON.stringify(result), {
      status: result.status,
      headers: { "Content-Type": "application/json" }
    });
  }),
});



/**
 * Public REST API: Retrieve Verification Result by Job ID
 * GET /v1/verifications/[jobId]
 */
http.route({
  pathPrefix: "/v1/verifications/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const apiKey = extractApiKey(request);
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        message: "Missing API key. Provide 'x-api-key' header or 'Authorization: Bearer <key>'." 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const jobId = pathParts[pathParts.length - 1];

    const result = await ctx.runAction(api.api_actions.getJobResult, {
      apiKey,
      jobId,
    });

    return new Response(JSON.stringify(result), {
      status: result.status,
      headers: { "Content-Type": "application/json" }
    });
  }),
});

export default http;
