import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Jalankan kode server asli dengan database tiruan; tidak menyentuh data bersama.
function load(file, imports) {
  const loaded = { exports: {} };
  const source = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("require", "module", "exports", source)((name) => {
    if (!(name in imports)) throw new Error(`Impor tanpa fixture: ${name}`);
    return imports[name];
  }, loaded, loaded.exports);
  return loaded.exports;
}
const enums = {
  JenisSertifikasi: { KEMNAKER: "KEMNAKER", BNSP: "BNSP", INTERNAL: "INTERNAL" },
  StatusPeserta: { LULUS: "LULUS", GAGAL: "GAGAL" },
};
function fixture(jenis = "KEMNAKER", duplicate = false) {
  const writes = [];
  const paths = [];
  const model = {
    findUnique: async () => ({ pesertaId: "peserta", pelaksanaanId: "kegiatan", pelaksanaan: { jenisSertifikasi: jenis } }),
    findFirst: async () => duplicate ? { peserta: { nama: "Peserta lain" }, pelaksanaan: { tingkatan: { training: { nama: "Pelatihan" } } } } : null,
    update: async (args) => { writes.push(args); return args.data; },
    updateMany: async (args) => { writes.push(args); return { count: args.where.id.in.length }; },
  };
  const prisma = { pesertaPelaksanaan: model, $transaction: (fn) => fn({ pesertaPelaksanaan: model }) };
  const actions = load("src/lib/data/action/sertifikatAction.ts", {
    "@/lib/prisma": { prisma }, "next/cache": { revalidatePath: (path) => paths.push(path) },
    "@/lib/generated/prisma/enums": enums,
  });
  return { actions, writes, paths, model };
}
test("hasil kosong tetap null dan field sertifikat opsional", async () => {
  const { actions, writes } = fixture();
  assert.equal((await actions.updateSertifikat("row", { status: null })).success, true);
  assert.equal(writes[0].data.status, null);
  assert.equal(writes[0].data.noSertifikat, null);
  assert.equal(writes[0].data.masaBerlaku, null);
});
test("INTERNAL mengosongkan field resmi; BNSP tidak menyimpan SKP", async () => {
  for (const jenis of ["INTERNAL", "BNSP", "KEMNAKER"]) {
    const { actions, writes } = fixture(jenis);
    await actions.updateSertifikat("row", { status: "LULUS", noSertifikat: " ABC ", noRegistrasi: "REG", noSkp: "SKP", masaBerlaku: "2027-10-07" });
    assert.equal(writes[0].data.noSertifikat, jenis === "INTERNAL" ? null : "ABC");
    assert.equal(writes[0].data.noSkp, jenis === "KEMNAKER" ? "SKP" : null);
    if (jenis === "INTERNAL") assert.equal(writes[0].data.masaBerlaku, null);
  }
});
test("nomor ganda memberi peringatan sesudah menyimpan", async () => {
  const { actions, writes } = fixture("KEMNAKER", true);
  const result = await actions.updateSertifikat("row", { status: null, noSertifikat: "ABC" });
  assert.equal(result.success, true);
  assert.match(result.peringatan, /sudah dipakai/);
  assert.equal(writes.length, 1);
});
test("data terhapus dan status asing ditolak tanpa menulis", async () => {
  const { actions, writes, model } = fixture();
  model.findUnique = async () => null;
  assert.equal((await actions.updateSertifikat("deleted", { status: null })).success, false);
  assert.equal((await actions.updateStatusMassal(["row"], "INVALID")).success, false);
  assert.equal((await actions.updateStatusMassal([], null)).success, false);
  assert.equal(writes.length, 0);
});
test("status massal null hanya mengubah baris dan parent aktif serta menyegarkan detail", async () => {
  const { actions, writes, paths } = fixture();
  assert.equal((await actions.updateStatusMassal(["a", "b"], null)).jumlah, 2);
  assert.equal(writes[0].data.status, null);
  assert.equal(writes[0].where.deletedAt, null);
  assert.equal(writes[0].where.pelaksanaan.deletedAt, null);
  assert.ok(paths.includes("/permohonan/[id]"));
});
test("batas aktif berganti saat tengah malam WIB dan tepat tujuh hari masih aktif", () => {
  const { whereKegiatanAktif } = load("src/lib/data/get/whereKegiatanAktif.ts", {});
  const before = whereKegiatanAktif(new Date("2026-10-06T16:59:59Z"));
  const after = whereKegiatanAktif(new Date("2026-10-06T17:00:00Z"));
  assert.equal(before.OR[1].sesi.some.tanggal.gte.toISOString(), "2026-09-29T00:00:00.000Z");
  assert.equal(after.OR[1].sesi.some.tanggal.gte.toISOString(), "2026-09-30T00:00:00.000Z");
  assert.deepEqual(after.OR[0], { sesi: { none: {} } });
});
