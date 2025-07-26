import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const roles = v.union(v.literal('admin'), v.literal('pegawai'));

export const pendidikanLevel = v.union(v.literal('S1'), v.literal('S2'), v.literal('S3'));

export default defineSchema({
    users: defineTable({
        tokenIdentifier: v.string(),
        nip: v.string(),
        role: roles,
        name: v.string(),
        image: v.optional(v.string()),

        golongan: v.optional(v.string()),
        pangkat: v.optional(v.string()),
        tanggalLahir: v.optional(v.string()),
        tmtPangkat: v.optional(v.string()),
        pendidikan: v.optional(pendidikanLevel),
        fcmToken: v.optional(v.string()),
    })
        .index('by_tokenIdentifier', ['tokenIdentifier'])
        .index('by_nip', ['nip']),

    riwayatKenaikanPangkat: defineTable({
        userId: v.id('users'),
        periodeNotifikasi: v.string(),
        tanggalNotifikasiDikirim: v.string(),

        dokumenTerkumpul: v.array(
            v.object({
                dokumenId: v.id('persyaratanDokumen'),
                namaDokumen: v.string(),
                disetujui: v.boolean(),
                tanggalDisetujui: v.optional(v.string()),
            })
        ),

        golonganSaatNotifikasi: v.string(),
        pangkatSaatNotifikasi: v.string(),
    }).index('by_userId', ['userId']),

    persyaratanDokumen: defineTable({
        namaDokumen: v.string(),
        deskripsi: v.optional(v.string()),
    }),
});
