import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { adminOnly, getUser } from './users';

export const getDaftarStatus = query({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError('Anda harus login.');
        const user = await getUser(ctx, identity.tokenIdentifier);
        if (user.role !== 'admin') throw new ConvexError('Hanya admin yang dapat melakukan aksi ini.');

        const riwayatList = await ctx.db.query('riwayatKenaikanPangkat').order('desc').collect();

        return Promise.all(
            riwayatList.map(async (riwayat) => {
                const user = await ctx.db.get(riwayat.userId);
                return {
                    ...riwayat,
                    namaPegawai: user?.name ?? 'N/A',
                    nipPegawai: user?.nip ?? 'N/A',
                };
            })
        );
    },
});

export const updateDokumenStatus = mutation({
    args: {
        riwayatId: v.id('riwayatKenaikanPangkat'),
        dokumenId: v.id('persyaratanDokumen'),
        disetujui: v.boolean(),
    },
    async handler(ctx, args) {
        await adminOnly(ctx);

        const riwayat = await ctx.db.get(args.riwayatId);
        if (!riwayat) throw new ConvexError('Riwayat tidak ditemukan');

        const updatedDokumen = riwayat.dokumenTerkumpul.map((doc) => {
            if (doc.dokumenId === args.dokumenId) {
                return {
                    ...doc,
                    disetujui: args.disetujui,
                    tanggalDisetujui: args.disetujui ? new Date().toISOString() : undefined,
                };
            }
            return doc;
        });

        await ctx.db.patch(riwayat._id, { dokumenTerkumpul: updatedDokumen });
    },
});
