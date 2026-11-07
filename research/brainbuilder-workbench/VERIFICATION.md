# Verification record

Verified on 7 November 2026 for workbench version 0.1.0.

- **14 integrity tests passed** with `python3 -m unittest discover -s tests -v`.
- **6 CLI smoke commands passed** in a temporary directory: initialize, import, re-import, generate search queue, record a planned query, and export a dated report.
- **All 8 notebook code cells executed** using Python's standard library against the temporary SQLite database, opened read-only.
- **Real-seed integration checks passed:** re-importing the source-backed seed reported **21 unchanged records**, all 14 integrity tests passed again, and all 8 notebook code cells executed against the actual seeded database.
- The CLI generated **18 planned search links and executed zero searches**.
- The HTML report exported successfully with its local filtering script. Source text and links are escaped; dangerous URL schemes and embedded credentials are rejected at import.

The tests specifically check independent-thread counting, exclusion of competitor/research/rejected records from customer counts, distinction between assistant and human checks, atomic input validation, idempotency, revision history, unknown query counts, date validation, link integrity, CSV/JSONL handling, spreadsheet formula protection, and capture-age flags.

Synthetic fixtures were confined to tests and automatically removed temporary directories. This verification did not recruit participants, collect live source data, demonstrate market demand, validate learning efficacy, or modify the production research database.

Graphical browser verification was attempted. The bundled Playwright installation had no browser executable, and no installed Chrome was available. No browser or dependency was installed. The interactive filtering behavior therefore remains unverified in a graphical browser. The report exported successfully; its four section-navigation targets and collapsed search-coverage details were checked with Python's standard-library HTML parser. Table wrappers retain horizontal overflow for narrow screens. Recheck visual layout and interactive behavior in the chosen browser when changing the report UI.
