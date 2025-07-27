import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

// Daftar Pangkat S1 yang menjadi batas akhir
const PANGKAT_S1_MAX = "III/d";

export const createPromotionRecord = internalMutation({
  args: {
    userId: v.id("users"),
    periodeNotifikasi: v.string(),
    golonganSaatNotifikasi: v.string(),
    pangkatSaatNotifikasi: v.string(),
    initialChecklist: v.array(
      v.object({
        dokumenId: v.id("persyaratanDokumen"),
        namaDokumen: v.string(),
        disetujui: v.boolean(),
      })
    ),
  },
  async handler(ctx, args) {
    await ctx.db.insert("riwayatKenaikanPangkat", {
      userId: args.userId,
      periodeNotifikasi: args.periodeNotifikasi,
      golonganSaatNotifikasi: args.golonganSaatNotifikasi,
      pangkatSaatNotifikasi: args.pangkatSaatNotifikasi,
      tanggalNotifikasiDikirim: new Date().toISOString().slice(0, 10),
      dokumenTerkumpul: args.initialChecklist,
    });
    console.log(
      `Berhasil membuat catatan kenaikan pangkat untuk user: ${args.userId}`
    );
  },
});

export const checkAndSendPromotionReminders = internalAction({
  handler: async (ctx) => {
    console.log(`Memulai pengecekan kenaikan pangkat.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allPegawai = await ctx.runQuery(
      internal.users.getPegawaiUsersInternal
    );
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

      if (pegawai.pendidikan === "S1" && pegawai.pangkat === PANGKAT_S1_MAX) {
        console.log(
          `Pegawai ${pegawai.name} dilewati karena sudah mencapai pangkat maksimal S1.`
        );
        continue;
      }

      const tmtDate = new Date(pegawai.tmtPangkat);
      let promotionDate: Date;
      let notifStartDate: Date;
      let periode: string;

      // --- LOGIKA UNTUK PRODUKSI (VERCEL) ---
      // eslint-disable-next-line prefer-const
      promotionDate = new Date(tmtDate);
      promotionDate.setFullYear(tmtDate.getFullYear() + 4); // H+4 Tahun
      promotionDate.setHours(0, 0, 0, 0);

      // eslint-disable-next-line prefer-const
      notifStartDate = new Date(promotionDate);
      notifStartDate.setMonth(notifStartDate.getMonth() - 2); // H-2 Bulan
      // eslint-disable-next-line prefer-const
      periode = `${promotionDate.getFullYear()}`;

      // --- LOGIKA UNTUK DEVELOPMENT (LOKAL) ---
    //   promotionDate = new Date(tmtDate);
    //   promotionDate.setDate(tmtDate.getDate() + 1); // H+1 Hari
    //   promotionDate.setHours(0, 0, 0, 0);

    //   notifStartDate = tmtDate;

    //   notifStartDate = new Date(promotionDate);
    //   notifStartDate.setHours(notifStartDate.getMinutes() - 4); // H-4 Menit
    //   // eslint-disable-next-line prefer-const
    //   periode = `DEV-${promotionDate.toISOString().slice(0, 10)}`;

      if (today >= notifStartDate && today <= promotionDate) {
        console.log(
          `Pegawai ${pegawai.name} memenuhi syarat tanggal untuk notifikasi.`
        );

        const existingRecord = await ctx.runQuery(
          internal.riwayat.getRiwayatForUserByPeriode,
          {
            userId: pegawai._id,
            periodeNotifikasi: periode,
          }
        );

        if (existingRecord.length === 0) {
          console.log(
            `MEMBUAT RECORD & MENGIRIM NOTIFIKASI PERTAMA untuk ${pegawai.name}...`
          );

          await ctx.runMutation(internal.reminder.createPromotionRecord, {
            userId: pegawai._id,
            periodeNotifikasi: periode,
            golonganSaatNotifikasi: pegawai.golongan ?? "",
            pangkatSaatNotifikasi: pegawai.pangkat ?? "",
            initialChecklist: initialChecklist,
          });

          await ctx.runAction(internal.push.sendPushNotification, {
            userId: pegawai._id,
            title: "Periode Kenaikan Pangkat Dimulai",
            body: `Halo ${pegawai.name}, persiapkan berkas kenaikan pangkat Anda mulai sekarang!`,
          });
        } else {
          if (today.getDay() === 1) {
            console.log(
              `Mengirim notifikasi MINGGUAN untuk ${pegawai.name}...`
            );
            await ctx.runAction(internal.push.sendPushNotification, {
              userId: pegawai._id,
              title: "🔔 Reminder Kenaikan Pangkat",
              body: `Jangan lupa, terus persiapkan berkas kenaikan pangkat Anda!`,
            });
          }
        }
      }
    }
    console.log("Pengecekan kenaikan pangkat selesai.");
  },
});
