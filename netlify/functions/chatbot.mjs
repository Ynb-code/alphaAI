
export default async (request) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Autoriser les requêtes OPTIONS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: cors
    });
  }

  // Accepter uniquement POST
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: cors }
    );
  }

  try {
    const body = await request.json();
    const message = body?.message;

    // Vérification du message
    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 1000
    ) {
      return Response.json(
        { error: "Invalid message" },
        { status: 400, headers: cors }
      );
    }

    // Vérifier la clé Groq
    if (!process.env.AI_API_KEY) {
      return Response.json(
        { error: "AI_API_KEY is missing" },
        { status: 500, headers: cors }
      );
    }

    // Appel de Groq
    const result = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: "Tu es un assistant sympathique sur le projet scratch AlphaAI de b_nanouche (tu t'appelles donc AlphaAI). Réponds en dans la langue ou l'utilisateur commence à parler (privilégie le français) de manière claire et concise. Aussi, n'utilise pas de Markdown, il ne marcherai pas sur scratch."
            },
            {
              role: "user",
              content: message.trim()
            }
          ],
          max_tokens: 300
        })
      }
    );

  if (!result.ok) {
  const details = await result.text();
  console.error("Erreur Groq :", result.status, details);
  console.log("DETAILS GROQ :", details);

  return Response.json(
    {
      error: "Erreur du service Groq",
      code: result.status
    },
    { status: 502, headers: cors }
  );
}

    const data = await result.json();

    const reply =
      data?.choices?.[0]?.message?.content;

    return Response.json(
      {
        reply: reply || "Je n'ai pas reçu de réponse."
      },
      {
        status: 200,
        headers: cors
      }
    );

  } catch (error) {
    return Response.json(
      { error: "Erreur interne du serveur" },
      { status: 500, headers: cors }
    );
  }
};
