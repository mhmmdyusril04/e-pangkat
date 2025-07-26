import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';

// Daftar Pangkat S1 yang menjadi batas akhir
const PANGKAT_S1_MAX = 'III/d';

export const createPromotionRecord = internalMutation({
    args: {
        userId: v.id('users'),
        periodeNotifikasi: v.string(),
        golonganSaatNotifikasi: v.string(),
        pangkatSaatNotifikasi: v.string(),
        initialChecklist: v.array(
            v.object({
                dokumenId: v.id('persyaratanDokumen'),
                namaDokumen: v.string(),
                disetujui: v.boolean(),
            })
        ),
    },
    async handler(ctx, args) {
        await ctx.db.insert('riwayatKenaikanPangkat', {
            userId: args.userId,
            periodeNotifikasi: args.periodeNotifikasi,
            golonganSaatNotifikasi: args.golonganSaatNotifikasi,
            pangkatSaatNotifikasi: args.pangkatSaatNotifikasi,
            tanggalNotifikasiDikirim: new Date().toISOString().slice(0, 10),
            dokumenTerkumpul: args.initialChecklist,
        });
        console.log(`Berhasil membuat catatan kenaikan pangkat untuk user: ${args.userId}`);
    },
});

export const checkAndSendPromotionReminders = internalAction({
    handler: async (ctx) => {
        console.log('Memulai pengecekan kenaikan pangkat...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const allPegawai = await ctx.runQuery(internal.users.getPegawaiUsersInternal);

        const semuaDokumen = await ctx.runQuery(api.dokumen.getAll);

        const initialChecklist = semuaDokumen.map((doc) => ({
            dokumenId: doc._id,
            namaDokumen: doc.namaDokumen,
            disetujui: false,
        }));

        for (const pegawai of allPegawai) {
            if (!pegawai.tmtPangkat || !pegawai.pendidikan) {
                continue;
            }

            if (pegawai.pendidikan === 'S1' && pegawai.pangkat === PANGKAT_S1_MAX) {
                console.log(`Pegawai ${pegawai.name} dilewati karena sudah mencapai pangkat maksimal S1.`);
                continue;
            }

            const tmtDate = new Date(pegawai.tmtPangkat);
            const targetNotificationDate = new Date(tmtDate);
            targetNotificationDate.setFullYear(tmtDate.getFullYear() + 4);
            targetNotificationDate.setMonth(targetNotificationDate.getMonth() - 2);
            targetNotificationDate.setHours(0, 0, 0, 0);

            if (today.getTime() === targetNotificationDate.getTime()) {
                console.log(`Pegawai ${pegawai.name} memenuhi syarat tanggal untuk notifikasi.`);

                const periode = `${tmtDate.getFullYear() + 4}`;

                const existingRecord = await ctx.runQuery(internal.riwayat.getRiwayatForUserByPeriode, {
                    userId: pegawai._id,
                    periodeNotifikasi: periode,
                });

                if (existingRecord.length > 0) {
                    console.log(`Notifikasi untuk ${pegawai.name} periode ${periode} sudah ada, dilewati.`);
                    continue;
                }

                console.log(`MEMBUAT RECORD & MENGIRIM NOTIFIKASI untuk ${pegawai.name}...`);
                await ctx.runMutation(internal.reminder.createPromotionRecord, {
                    userId: pegawai._id,
                    periodeNotifikasi: periode,
                    golonganSaatNotifikasi: pegawai.golongan ?? '',
                    pangkatSaatNotifikasi: pegawai.pangkat ?? '',
                    initialChecklist: initialChecklist,
                });

                await ctx.runAction(internal.push.sendPushNotification, {
                    userId: pegawai._id,
                    title: '🔔 Reminder Kenaikan Pangkat',
                    body: `Halo ${pegawai.name}, sudah waktunya mempersiapkan kenaikan pangkat Anda!`,
                });
            }
        }
        console.log('Pengecekan kenaikan pangkat selesai.');
    },
});
