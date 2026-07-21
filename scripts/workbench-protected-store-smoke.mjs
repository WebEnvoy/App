import { mkdtemp, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { ProtectedWorkbenchStore } = await import(
  pathToFileURL(path.resolve("dist-electron/protectedWorkbenchStore.js")).href
);
const root = await mkdtemp(path.join(os.tmpdir(), "webenvoy-protected-store-"));
const storePath = path.join(root, "protected-workbench.bin");
const selectedPath = path.join(root, "selected.txt");
const codec = {
  encrypt: (value) => Buffer.from(`encrypted:${Buffer.from(value).toString("base64")}`),
  decrypt: (value) => Buffer.from(value.toString().slice("encrypted:".length), "base64").toString(),
};
const context = {
  packageRef: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
  version: "0.1.0",
  identityId: "identity-restart",
};

try {
  await writeFile(selectedPath, "selected content");
  let failNextWrite = true;
  const recoveringCodec = {
    ...codec,
    encrypt: (value) => {
      if (failNextWrite) {
        failNextWrite = false;
        throw new Error("synthetic first write failure");
      }
      return codec.encrypt(value);
    },
  };
  const recovering = await ProtectedWorkbenchStore.open(path.join(root, "recovering-store.bin"), recoveringCodec);
  const failedRef = await recovering.registerFile({ path: selectedPath, name: "failed.txt", size: 16, type: "text/plain", lastModified: Date.now() });
  const recoveredRef = await recovering.registerFile({ path: selectedPath, name: "recovered.txt", size: 16, type: "text/plain", lastModified: Date.now() });
  if (failedRef != null || recoveredRef == null) throw new Error("Protected store write queue did not recover after a failed write.");

  const first = await ProtectedWorkbenchStore.open(storePath, codec);
  const localRef = await first.registerFile({
    path: selectedPath,
    name: "selected.txt",
    size: 16,
    type: "text/plain",
    lastModified: Date.now(),
  });
  if (localRef == null) throw new Error("Selected file was not registered.");
  const orphanRef = await first.registerFile({
    path: selectedPath,
    name: "orphan.txt",
    size: 16,
    type: "text/plain",
    lastModified: Date.now(),
  });
  if (orphanRef == null || !await first.releaseLocalRefs([orphanRef]) ||
    (await first.checkLocalRef(orphanRef)).reason !== "invalid_reference" ||
    await first.releaseLocalRefs([selectedPath])) {
    throw new Error("Explicit local-ref release accepted a path or retained an orphan reference.");
  }
  const saved = await first.saveDraft({
    context,
    values: { body: "restart draft", sections: ["title"] },
    attachments: { attachments: [{ id: "attachment-1", localRef, name: "selected.txt", size: 16, type: "text/plain", lastModified: Date.now() }] },
    omittedFieldIds: ["password"],
  });
  if (!saved) throw new Error("Protected draft was not saved.");
  for (let index = 0; index < 256; index += 1) {
    const extraRef = await first.registerFile({
      path: selectedPath,
      name: `extra-${index}.txt`,
      size: 16,
      type: "text/plain",
      lastModified: Date.now(),
    });
    if (extraRef == null) throw new Error(`File capacity rejected an evictable reference at ${index}.`);
  }
  if (!(await first.checkLocalRef(localRef)).readable) throw new Error("File capacity eviction removed a draft-owned local ref.");
  const encrypted = await readFile(storePath);
  if (encrypted.includes(Buffer.from(selectedPath)) || encrypted.includes(Buffer.from("restart draft"))) {
    throw new Error("Protected store leaked plaintext path or draft content.");
  }

  const restarted = await ProtectedWorkbenchStore.open(storePath, codec);
  const restored = restarted.loadDraft(context);
  const readable = await restarted.checkLocalRef(localRef);
  const pathProbe = await restarted.checkLocalRef(selectedPath);
  const forgedProbe = await restarted.checkLocalRef("local_file_ref_00000000-0000-4000-8000-000000000099");
  if (restored?.values.body !== "restart draft" || restored.attachments.attachments?.[0]?.name !== "selected.txt" ||
    !readable.readable || pathProbe.reason !== "invalid_reference" || forgedProbe.reason !== "invalid_reference") {
    throw new Error("Restart restoration or arbitrary-path rejection failed.");
  }

  await unlink(selectedPath);
  if ((await restarted.checkLocalRef(localRef)).reason !== "unreadable") throw new Error("Restarted local ref was not revalidated.");
  if (!await restarted.saveDraft({ context, values: { body: "without attachment" }, attachments: {}, omittedFieldIds: [] }) ||
    (await restarted.checkLocalRef(localRef)).reason !== "invalid_reference") {
    throw new Error("Draft overwrite did not revoke its removed local ref.");
  }
  if (await restarted.saveDraft({ context, values: { accessToken: "forbidden" }, attachments: {}, omittedFieldIds: [] }) ||
    await restarted.saveDraft({ context, values: { url: "https://example.test/?xsec_token=forbidden" }, attachments: {}, omittedFieldIds: [] }) ||
    await restarted.saveDraft({ context, values: { url: "https://blob.example.test/file?sv=2024-11-04&sp=r&sig=synthetic-secret" }, attachments: {}, omittedFieldIds: [] }) ||
    await restarted.saveDraft({ context, values: { url: "https://s3.example.test/file?X-Amz-Signature=synthetic-secret" }, attachments: {}, omittedFieldIds: [] }) ||
    await restarted.saveDraft({ context, values: { url: "https://storage.example.test/file?X-Goog-Signature=synthetic-secret" }, attachments: {}, omittedFieldIds: [] }) ||
    await restarted.saveDraft({ context, values: { url: "https://auth.example.test/callback#access_token=synthetic-secret" }, attachments: {}, omittedFieldIds: [] }) ||
    await restarted.saveDraft({ context, values: { url: "https://blob.example.test/file#?sv=2024-11-04&sig=synthetic-secret" }, attachments: {}, omittedFieldIds: [] }) ||
    await restarted.saveDraft({ context, values: { securityId: "forbidden" }, attachments: {}, omittedFieldIds: [] })) {
    throw new Error("Sensitive field key was persisted.");
  }
  if (await restarted.saveDraft({ context, values: { body: "x".repeat(70 * 1024) }, attachments: {}, omittedFieldIds: [] })) {
    throw new Error("Oversized draft was persisted.");
  }
  if (!await restarted.deleteDraft(context) || (await restarted.checkLocalRef(localRef)).reason !== "invalid_reference") {
    throw new Error("Draft deletion did not clean its local refs.");
  }
  if ((await readdir(root)).some((name) => name.endsWith(".tmp"))) throw new Error("Atomic write left a temporary file.");

  await writeFile(storePath, "corrupt plaintext");
  const recovered = await ProtectedWorkbenchStore.open(storePath, codec);
  if (recovered.loadDraft(context) != null) throw new Error("Corrupt protected store was accepted.");
  const unavailable = await ProtectedWorkbenchStore.open(storePath, null);
  if (unavailable.available || await unavailable.saveDraft({ context, values: {}, attachments: {}, omittedFieldIds: [] })) {
    throw new Error("Unavailable safe storage did not fail closed.");
  }
  process.stdout.write(`${JSON.stringify({ restartRestored: true, arbitraryPathRejected: true, capacityPreservedOwnedRef: true, queueRecovered: true, orphanRefReleased: true, removedRefRevoked: true, sensitiveValuesRejected: true, corruptRecovered: true })}\n`);
} finally {
  await rm(root, { recursive: true, force: true });
}
