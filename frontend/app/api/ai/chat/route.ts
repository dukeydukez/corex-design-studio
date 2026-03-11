import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the COREX Design Studio AI Assistant — a creative director, designer, and copywriter rolled into one. You help users create professional designs directly on their canvas.

When the user asks you to modify the canvas, respond with clear instructions AND include a JSON action block that the frontend can parse and execute. Format canvas actions like this:

\`\`\`json
{"actions": [
  {"type": "addElement", "element": {"type": "text", "x": 100, "y": 100, "width": 400, "height": 60, "content": "Your Text", "fontSize": 48, "fontFamily": "Inter", "fontWeight": 700, "colour": "#ffffff", "fill": "transparent", "stroke": "none", "name": "Heading"}},
  {"type": "addElement", "element": {"type": "rect", "x": 0, "y": 0, "width": 1080, "height": 1080, "fill": "#1a1a1a", "name": "Background"}},
  {"type": "updateElement", "elementId": "some-id", "updates": {"fill": "#ff0000"}},
  {"type": "deleteElement", "elementId": "some-id"}
]}
\`\`\`

Available element types: text, rect, circle, line, star, polygon
Available properties: x, y, width, height, fill, stroke, strokeWidth, opacity, rotation, borderRadius, blur, content, fontSize, fontFamily, fontWeight, textAlign, colour, letterSpacing, lineHeight, name, points (for star/polygon)

Canvas context will be provided so you know the current design state.

Be specific, actionable, and professional. When giving design advice, reference specific elements on their canvas. When creating designs, think like a top-tier creative director — bold, intentional, and visually striking.

Use Canadian English spelling.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  context: string;
  canvasData?: object;
}

function validateRequestBody(
  body: unknown
): { valid: true; data: ChatRequestBody } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const { messages, context, canvasData } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      valid: false,
      error: "messages must be a non-empty array.",
    };
  }

  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: "Each message must be an object." };
    }
    const { role, content } = msg as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") {
      return {
        valid: false,
        error: "Each message role must be 'user' or 'assistant'.",
      };
    }
    if (typeof content !== "string" || content.trim().length === 0) {
      return {
        valid: false,
        error: "Each message content must be a non-empty string.",
      };
    }
  }

  if (typeof context !== "string") {
    return { valid: false, error: "context must be a string." };
  }

  if (canvasData !== undefined && typeof canvasData !== "object") {
    return { valid: false, error: "canvasData must be an object if provided." };
  }

  return {
    valid: true,
    data: {
      messages: messages as ChatMessage[],
      context: context as string,
      canvasData: canvasData as object | undefined,
    },
  };
}

function buildSystemPrompt(context: string, canvasData?: object): string {
  const parts = [SYSTEM_PROMPT];

  if (context.trim().length > 0) {
    parts.push(`\n\nCurrent context: ${context}`);
  }

  if (canvasData) {
    parts.push(
      `\n\nCurrent canvas state:\n\`\`\`json\n${JSON.stringify(canvasData, null, 2)}\n\`\`\``
    );
  }

  return parts.join("");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const validation = validateRequestBody(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { messages, context, canvasData } = validation.data;
  const systemPrompt = buildSystemPrompt(context, canvasData);

  const client = new Anthropic({ apiKey });

  try {
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = `data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(chunk));
            }

            if (event.type === "message_stop") {
              const done = `data: ${JSON.stringify({ type: "done" })}\n\n`;
              controller.enqueue(encoder.encode(done));
            }
          }
        } catch (streamError) {
          const errorMessage =
            streamError instanceof Error
              ? streamError.message
              : "Stream error occurred.";
          const errorChunk = `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`;
          controller.enqueue(encoder.encode(errorChunk));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Anthropic.APIError
        ? `Claude API error: ${error.message}`
        : error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

    const status =
      error instanceof Anthropic.APIError ? error.status ?? 500 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
