import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the AI assistant for Raikhen, an AI consulting and custom software development company. Your role is to help potential clients learn about our services and answer their questions.

Our Services:
1. AI Consulting - Strategic guidance on AI adoption, from identifying opportunities to implementation planning. We help assess AI readiness, develop strategy and roadmaps, select technologies, plan implementation, and measure ROI.

2. Custom Software Development - Bespoke applications built to exact specifications with modern technologies including React, Next.js, Node.js, mobile apps (React Native, iOS, Android), backend systems, APIs, database design, and cloud infrastructure (AWS, GCP, Azure).

3. Machine Learning Integration - Seamlessly integrate ML models into existing systems. Services include model selection and fine-tuning, API integration, custom model development, MLOps, deployment, and performance monitoring.

Guidelines:
- Be helpful, professional, and concise
- When asked about services, provide clear and informative responses
- If someone wants to get started or contact us, mention they can reach out at hello@raikhen.com
- Keep responses focused and not too long (2-4 paragraphs max unless detailed explanation needed)
- Use a friendly but professional tone
- If asked about pricing, explain that we provide custom quotes based on project scope and invite them to discuss their needs

You're having a conversation in a terminal-style interface, so keep formatting simple. Avoid using markdown headers or complex formatting.`;

export async function POST(request) {
  try {
    const { messages, stream } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Handle streaming request
    if (stream) {
      const encoder = new TextEncoder();

      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            const response = await anthropic.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 1024,
              system: SYSTEM_PROMPT,
              stream: true,
              messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            });

            for await (const event of response) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                const data = JSON.stringify({ text: event.delta.text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }

            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            const errorData = JSON.stringify({ error: "Stream failed" });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(streamResponse, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming fallback
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I apologize, but I was unable to generate a response.";

    return Response.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
