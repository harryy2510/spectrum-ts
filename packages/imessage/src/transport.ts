import {
  createGrpcClient,
  type AdvancedIMessage as StreamingClient,
} from "@photon-ai/advanced-imessage/grpc";
import {
  type ClientOptions,
  createHttpClient,
  type AdvancedIMessage as UnaryClient,
} from "@photon-ai/advanced-imessage/http";
import { UnsupportedError } from "@spectrum-ts/core";

export type IMessageTransport = "grpc" | "http";

export const DEFAULT_IMESSAGE_TRANSPORT: IMessageTransport = "grpc";

export type IMessageStreamingClient = StreamingClient;

export type IMessageTransportHandle =
  | { client: StreamingClient; transport?: "grpc" }
  | { client: UnaryClient; transport: "http" };

export const createHandle = (
  transport: IMessageTransport,
  options: ClientOptions
): IMessageTransportHandle => {
  const defaults = { autoIdempotency: true, retry: true, tls: true } as const;
  return transport === "http"
    ? { client: createHttpClient({ ...defaults, ...options }), transport }
    : { client: createGrpcClient({ ...defaults, ...options }), transport };
};

export const requireStreamingClient = (
  handle: IMessageTransportHandle
): IMessageStreamingClient => {
  if (handle.transport === "http") {
    throw UnsupportedError.action(
      "message stream",
      "imessage",
      "The HTTP transport carries no event streams. Receive inbound messages over webhooks, or configure the gRPC transport to use the live stream."
    );
  }
  return handle.client;
};
