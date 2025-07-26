import { createClerkClient } from '@clerk/backend';
import { ConvexError, v } from 'convex/values';
import { internalMutation, internalQuery, mutation, MutationCtx, query, QueryCtx } from './_generated/server';
import { pendidikanLevel, roles } from './schema';

export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string | undefined) {
    if (!tokenIdentifier) {
        throw new ConvexError('Anda belum login.');
    }

    const user = await ctx.db
        .query('users')
        .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', tokenIdentifier))
        .first();

    if (!user) {
        throw new ConvexError('User tidak ditemukan.');
    }

    return user;
}

export const getMe = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        return await getUser(ctx, identity.tokenIdentifier);
    },
});

export async function adminOnly(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Anda harus login.');
    const user = await getUser(ctx, identity.tokenIdentifier);
    if (user.role !== 'admin') throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');
    return user;
}

export const getPegawaiUsers = query({
    args: {},
    async handler(ctx) {
        await adminOnly(ctx);

        const pegawaiUsers = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('role'), 'pegawai'))
            .order('desc')
            .collect();

        return pegawaiUsers;
    },
});

export const getUserById = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const adminUpdatePegawaiData = mutation({
    args: {
        userId: v.id('users'),
        nip: v.string(),
        role: roles,
        name: v.string(),
        pangkat: v.string(),
        golongan: v.string(),
        tanggalLahir: v.string(),
        tmtPangkat: v.string(),
        pendidikan: pendidikanLevel,
    },
    async handler(ctx, args) {
        await adminOnly(ctx);
        const { userId, ...rest } = args;

        const user = await ctx.db.get(userId);
        if (!user) {
            throw new ConvexError('User tidak ditemukan untuk diperbarui.');
        }

        await ctx.db.patch(userId, rest);
    },
});

export const adminDeleteUser = mutation({
    args: { userId: v.id('users') },
    async handler(ctx, args) {
        await adminOnly(ctx);

        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new ConvexError('User tidak ditemukan untuk dihapus.');
        }

        const riwayatTerkait = await ctx.db
            .query('riwayatKenaikanPangkat')
            .withIndex('by_userId', (q) => q.eq('userId', args.userId))
            .collect();

        const deletePromises = riwayatTerkait.map((riwayat) => ctx.db.delete(riwayat._id));
        await Promise.all(deletePromises);

        await ctx.db.delete(args.userId);

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUserId = user.tokenIdentifier.split('|')[1];
        if (clerkUserId) {
            await clerkClient.users.deleteUser(clerkUserId);
        }
    },
});

export const getAllUsers = internalQuery({
    args: {},
    async handler(ctx) {
        return await ctx.db.query('users').collect();
    },
});

export const getPegawaiUsersInternal = internalQuery({
    args: {},
    async handler(ctx) {
        return await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('role'), 'pegawai'))
            .collect();
    },
});

export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
        role: roles,
        nip: v.optional(v.string()),
    },
    async handler(ctx, args) {
        const existingUser = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
            .first();

        if (existingUser) {
            console.log('User sudah ada, tidak perlu membuat lagi.');
            return;
        }

        await ctx.db.insert('users', {
            tokenIdentifier: args.tokenIdentifier,
            name: args.name,
            image: args.image,
            role: args.role ? args.role : 'admin',
            nip: args.nip || '',
        });
    },
});

export const updateUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
    },
    async handler(ctx, args) {
        const user = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
            .first();

        if (!user) {
            console.error('User tidak ditemukan untuk diupdate.');
            return;
        }

        await ctx.db.patch(user._id, {
            name: args.name,
            image: args.image,
        });
    },
});

export const deleteUser = internalMutation({
    args: { tokenIdentifier: v.string() },
    async handler(ctx, args) {
        const user = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', args.tokenIdentifier))
            .first();

        if (!user) {
            console.error('User tidak ditemukan untuk dihapus.');
            return;
        }

        const riwayatTerkait = await ctx.db
            .query('riwayatKenaikanPangkat')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .collect();
        await Promise.all(riwayatTerkait.map((r) => ctx.db.delete(r._id)));

        await ctx.db.delete(user._id);
    },
});
