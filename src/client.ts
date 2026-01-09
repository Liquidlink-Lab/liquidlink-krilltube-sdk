import { ApiClient } from "./api-client";
import { CONFIG } from "./consts";

type ChainId = "iota" | "sui";

type PointsMutationRequest = {
  address: string;
  points: number;
};

type PointsLogsQuery = {
  address: string;
  limit?: number;
  offset?: number;
  start_time?: number;
  end_time?: number;
};

export class Client {
  #config;
  #apiClient: ApiClient;
  #chain: ChainId;

  constructor({
    chain,
    network = "mainnet",
    apiKey,
  }: { chain: ChainId; network: "testnet" | "mainnet"; rpcUrl?: string; apiKey: string }) {
    this.#config = CONFIG[chain][network];
    this.#apiClient = new ApiClient({
      baseUrl: `${this.#config.API_BASE_URL}`,
      apiKey,
    });
    this.#chain = chain;
  }

  getConfig() {
    return this.#config;
  }

  getApiClient() {
    return this.#apiClient;
  }

  async ping() {
    return await this.#apiClient.getJSON<{ message: string }>("/api/v1");
  }

  async addPoints(payload: PointsMutationRequest) {
    return await this.#apiClient.postJSON("/api/v1/points/add", { ...payload, chain: this.#chain });
  }

  async subPoints(payload: PointsMutationRequest) {
    return await this.#apiClient.postJSON("/api/v1/points/sub", { ...payload, chain: this.#chain });
  }

  async getPointsLogs(query: PointsLogsQuery) {
    return await this.#apiClient.getJSON("/api/v1/points/logs", { ...query, chain: this.#chain });
  }

  async getPointsByAddress(query: { address: string }) {
    return await this.#apiClient.getJSON("/api/v1/points", { ...query, chain: this.#chain });
  }
}
