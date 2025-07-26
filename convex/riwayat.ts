import { ConvexError, v } from 'convex/values';
import { internalQuery, query } from './_generated/server';
import { getUser } from './users';

export const getRiwayat = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error('Anda harus login.');
        const user = await getUser(ctx, identity.tokenIdentifier);
        if (user.role !== 'admin') throw new Error('Hanya admin yang dapat melakukan aksi ini.');

        const riwayatList = await ctx.db.query('riwayatKenaikanPangkat').order('desc').collect();

        const results = await Promise.all(
            riwayatList.map(async (riwayat) => {
                const user = await ctx.db.get(riwayat.userId);
                return {
                    ...riwayat,
                    namaPegawai: user?.name ?? 'N/A',
                    nipPegawai: user?.nip ?? 'N/A',
                };
            })
        );

        return results;
    },
});

export const getRiwayatForUserByPeriode = internalQuery({
    args: {
        userId: v.id('users'),
        periodeNotifikasi: v.string(),
    },
    async handler(ctx, args) {
        return await ctx.db
            .query('riwayatKenaikanPangkat')
            .withIndex('by_userId', (q) => q.eq('userId', args.userId))
            .filter((q) => q.eq(q.field('periodeNotifikasi'), args.periodeNotifikasi))
            .collect();
    },
});

export const getMyPromotionHistory = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const user = await getUser(ctx, identity.tokenIdentifier);
        if (!user) {
            throw new ConvexError('User tidak ditemukan.');
        }

        return await ctx.db
            .query('riwayatKenaikanPangkat')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .order('desc')
            .collect();
    },
});
