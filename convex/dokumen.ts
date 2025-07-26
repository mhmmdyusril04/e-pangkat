import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { adminOnly } from './users';

export const getAll = query({
    args: {},
    async handler(ctx) {
        return await ctx.db.query('persyaratanDokumen').collect();
    },
});

export const createDokumen = mutation({
    args: { namaDokumen: v.string(), deskripsi: v.optional(v.string()) },
    async handler(ctx, args) {
        await adminOnly(ctx);
        await ctx.db.insert('persyaratanDokumen', args);
    },
});

export const deleteDokumen = mutation({
    args: { id: v.id('persyaratanDokumen') },
    async handler(ctx, args) {
        await adminOnly(ctx);
        await ctx.db.delete(args.id);
    },
});
