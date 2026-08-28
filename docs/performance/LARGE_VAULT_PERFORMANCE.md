# Large Evidence Vault Performance

Measured August 28, 2026 on the Windows development workstation. These results
are regression evidence, not performance guarantees for every user device.

## Dataset and method

- 10,000 unique evidence records in IndexedDB
- Approximately 4.60 MiB as compact integrity-protected JSON
- 50 document controls rendered per Vault page
- 25 evidence-history records rendered per history page
- Chromium production-build navigation for browser timings
- Fake IndexedDB plus production services for repeatable storage, backup, and
  restore timings
- 25 MiB zero-filled buffer for SHA-256 document-hashing coverage

## Observed results

| Operation | Observed time |
| --- | ---: |
| IndexedDB replace/write | 92 ms |
| IndexedDB startup read and date sort | 45 ms |
| Group, search, sort, and page | 4 ms |
| SHA-256 hash of 25 MiB | 20 ms |
| Backup integrity creation | 14 ms |
| Backup structure and integrity validation | 18 ms |
| Import preview against 10,000 existing records | 4 ms |
| Import and merge into an empty Vault | 18 ms |
| PBKDF2/AES-GCM encrypted export | 301 ms |
| PBKDF2/AES-GCM decrypt | 45 ms |
| Browser reload through visible 10,000-record Vault | 621 ms |
| Browser search update | 22 ms |
| Browser sort update | 22 ms |

Chromium reported approximately 9.5 MiB of used JavaScript heap after the Vault
became visible. The browser exposes this as a coarse diagnostic value, so it is
recorded as an observation rather than a portable memory guarantee.

## Improvements made during the audit

Backup import preview previously searched the existing-record array once for
every backup record. Backup import also inserted each new record at the front of
a growing array. Both paths were quadratic. They now use an ID-to-record map and
a single linear merge while preserving the existing record-order behavior.

## Regression limits

Automated service operations must each complete within 10 seconds. The Chromium
large-Vault flow must become visible within 5 seconds, and search and sorting
must each settle within 2 seconds. These are failure ceilings rather than target
latencies; the observed results are substantially lower.

## Cursor-paging decision

Cursor-based IndexedDB paging is not required for the tested 10,000-record
public-alpha target. The current Vault still reads all evidence metadata to
support global grouping, search, sorting, statistics, and complete backups.

Revisit a derived document index and cursor-backed repository API before raising
the supported target materially above 10,000 unique fingerprints, or if
representative low-tier devices exceed a 2-second Vault-ready target. Backups
must remain complete exports even if interactive browsing later becomes
cursor-backed.
