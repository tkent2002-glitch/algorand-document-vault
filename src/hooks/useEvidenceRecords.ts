import { useEffect, useState } from "react";
import {
  EvidenceRepository,
  type EvidenceRepositoryEvent,
} from "../repositories";
import type { EvidenceRecord } from "../services";

export function applyEvidenceRepositoryEvent(
  records: EvidenceRecord[],
  event: EvidenceRepositoryEvent
): EvidenceRecord[] {
  if (event.type === "clear") {
    return [];
  }

  if (event.type === "replace") {
    return [...event.records];
  }

  const existingIndex = records.findIndex(
    (record) => record.id === event.record.id
  );

  if (existingIndex === -1) {
    return [...records, event.record];
  }

  const updated = [...records];
  updated[existingIndex] = event.record;
  return updated;
}

export function useEvidenceRecords(): EvidenceRecord[] {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    let mounted = true;
    let initialSnapshotLoaded = false;
    const pendingEvents: EvidenceRepositoryEvent[] = [];

    const unsubscribe = EvidenceRepository.subscribe((event) => {
      if (!mounted) {
        return;
      }

      if (!initialSnapshotLoaded) {
        pendingEvents.push(event);
        return;
      }

      setRecords((currentRecords) =>
        applyEvidenceRepositoryEvent(currentRecords, event)
      );
    });

    void EvidenceRepository.listAsync().then((repositoryRecords) => {
      if (!mounted) {
        return;
      }

      const currentRecords = pendingEvents.reduce(
        applyEvidenceRepositoryEvent,
        repositoryRecords
      );
      pendingEvents.length = 0;
      initialSnapshotLoaded = true;
      setRecords(currentRecords);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return records;
}
