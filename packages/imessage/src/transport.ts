import type { AdvancedIMessage as StreamingClient } from "@photon-ai/advanced-imessage/grpc";
import type {
  ClientOptions,
  AdvancedIMessage as UnaryClient,
} from "@photon-ai/advanced-imessage/http";
import { UnsupportedError } from "@spectrum-ts/core";

export type IMessageTransport = "grpc" | "http";

export const DEFAULT_IMESSAGE_TRANSPORT: IMessageTransport = "grpc";

export type IMessageStreamingClient = StreamingClient;

export type IMessageTransportHandle =
  | { client: StreamingClient; transport?: "grpc" }
  | { client: UnaryClient; transport: "http" };

export const loadClientFactory = async (
  transport: IMessageTransport
): Promise<(options: ClientOptions) => IMessageTransportHandle> => {
  const defaults = { autoIdempotency: true, retry: true, tls: true } as const;

  if (transport === "http") {
    const { createHttpClient } = await import(
      "@photon-ai/advanced-imessage/http"
    );
    return (options) => ({
      client: createHttpClient({ ...defaults, ...options }),
      transport: "http",
    });
  }

  const { createGrpcClient } = await import(
    "@photon-ai/advanced-imessage/grpc"
  );
  return (options) => ({
    client: createGrpcClient({ ...defaults, ...options }),
    transport: "grpc",
  });
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
