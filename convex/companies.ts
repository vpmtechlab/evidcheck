import { query } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./session";

/**
 * Returns the caller's own company document.
 * (Previously returned a hardcoded super-admin company for any caller.)
 */
export const getDefaultCompany = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionToken);
    return await ctx.db.get(session.companyId);
  },
});
