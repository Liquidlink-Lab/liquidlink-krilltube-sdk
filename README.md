# liquidlink-krilltube-sdk

A lightweight SDK for Liquidlink Krilltube to call the Incentive Backend and manage user points.

## Installation

```bash
bun add @liquidlink-lab/liquidlink-krilltube-sdk
# or
npm install @liquidlink-lab/liquidlink-krilltube-sdk
# or
pnpm add @liquidlink-lab/liquidlink-krilltube-sdk
```

## Quick Start

```ts
import { Client } from "@liquidlink-lab/liquidlink-krilltube-sdk";

const client = new Client({
  chain: "sui",
  network: "mainnet",
  apiKey: process.env.API_KEY!,
});

const ping = await client.ping();
console.log(ping.message);

await client.addPoints({ address: "0xabc...", points: 10 });
const points = await client.getPointsByAddress({ address: "0xabc..." });
console.log(points);
```

## API

### `new Client(options)`

- `chain`: `"iota" | "sui"`
- `network`: `"testnet" | "mainnet"`
- `apiKey`: API key

### `client.ping()`

Returns the backend health message.

### `client.addPoints(payload)`

- `payload.address`: User address
- `payload.points`: Points to add

### `client.subPoints(payload)`

- `payload.address`: User address
- `payload.points`: Points to subtract

### `client.getPointsByAddress(query)`

- `query.address`: User address

### `client.getPointsLogs(query)`

- `query.address`: User address
- `query.limit`: Page size
- `query.offset`: Offset
- `query.start_time`: Start timestamp (seconds)
- `query.end_time`: End timestamp (seconds)

## Configuration

The SDK selects the built-in API base URL by `chain` and `network`. You can access the current config via `getConfig()`:

```ts
const config = client.getConfig();
console.log(config.API_BASE_URL);
```

## License

MIT
