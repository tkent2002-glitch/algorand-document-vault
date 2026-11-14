import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { upgradeEvidenceDatabase } from "../../src/storage/evidence/IndexedDbSchema";
import { StorageConfiguration } from "../../src/storage/StorageConfiguration";

function openDatabase(
  name: string,
  version: number,
  onUpgrade: (request: IDBOpenDBRequest) => void
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.addEventListener("upgradeneeded", () => onUpgrade(request));
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

describe("IndexedDB Version 2 schema migration", () => {
  it("adds batch stores without changing Version 1 evidence", async () => {
    const name = `adv-schema-${crypto.randomUUID()}`;
    const configuration = StorageConfiguration.indexedDb;
    const versionOne = await openDatabase(name, 1, (request) => {
      request.result.createObjectStore(configuration.evidenceObjectStoreName, {
        keyPath: "id",
      });
    });
    const write = versionOne.transaction(
      configuration.evidenceObjectStoreName,
      "readwrite"
    );
    write.objectStore(configuration.evidenceObjectStoreName).put({
      id: "existing-record",
      hashValue: "a".repeat(64),
    });
    await new Promise<void>((resolve) => {
      write.addEventListener("complete", () => resolve());
    });
    versionOne.close();

    const versionTwo = await openDatabase(name, 2, (request) => {
      upgradeEvidenceDatabase(request.result, request.transaction);
    });

    expect(
      versionTwo.objectStoreNames.contains(configuration.batchObjectStoreName)
    ).toBe(true);
    expect(
      versionTwo.objectStoreNames.contains(
        configuration.batchMemberObjectStoreName
      )
    ).toBe(true);

    const read = versionTwo.transaction(
      configuration.evidenceObjectStoreName,
      "readonly"
    );
    const getRequest = read
      .objectStore(configuration.evidenceObjectStoreName)
      .get("existing-record");
    const existing = await new Promise<unknown>((resolve, reject) => {
      getRequest.addEventListener("success", () => resolve(getRequest.result));
      getRequest.addEventListener("error", () => reject(getRequest.error));
    });

    expect(existing).toMatchObject({ id: "existing-record" });
    versionTwo.close();
    indexedDB.deleteDatabase(name);
  });
});
