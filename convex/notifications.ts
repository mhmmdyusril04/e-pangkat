import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const saveFcmToken = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('User not authenticated');
        }

        const user = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
            .unique();

        if (!user) {
            throw new Error('User not found');
        }

        await ctx.db.patch(user._id, { fcmToken: args.token });
    },
});
