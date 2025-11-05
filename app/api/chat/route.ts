import { NextRequest } from "next/server";
import { ChatRequest } from "@/lib/chat/types";
import { getProviderStream } from "@/lib/providers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;

    const stream = await getProviderStream(body);
    const encoder = new TextEncoder();

    const rs = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { value, done } = await stream.next();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(value ?? ""));
      },
      cancel() {
        // no-op
      },
    });

    return new Response(rs, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
      status: 200,
    });
  } catch (err: any) {
    return new Response(`Error: ${err?.message || "unknown"}`, { status: 400 });
  }
}
