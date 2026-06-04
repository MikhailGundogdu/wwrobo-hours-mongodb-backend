# wwrobo-hours-mongodb-backend

The BLE attendance migration does not change this service's log schema. The
Cloudflare API still forwards completed hours as:

```json
{ "session": "Practice", "id": "123456", "minutes": 90, "timestamp": "2026-05-22T18:00:00.000Z" }
```

The existing practice/outreach/competition collections and aggregation routes
remain the source of truth for completed hours.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.








:)