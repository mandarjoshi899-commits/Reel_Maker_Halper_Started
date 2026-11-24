
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });

export async function onRequestPost({ request, env }) {
  try {
    const token = env.REPLICATE_API_TOKEN;

    if (!token) {
      return json({ error: "Replicate token is not configured." }, 500);
    }

    const body = await request.json();
    const mode = body.mode;
    const prompt = String(body.prompt || "").trim();

    if (!prompt || prompt.length > 1000) {
      return json({ error: "Enter a prompt under 1000 characters." }, 400);
    }

    let model = "wan-video/wan-2.2-t2v-fast";

    const input = {
      prompt,
      go_fast: true,
      num_frames: 81,
      resolution: "480p",
      aspect_ratio: "9:16"
    };

    if (mode === "image") {
      model = "wan-video/wan-2.2-i2v-fast";

      if (!body.image || typeof body.image !== "string") {
        return json({ error: "Please provide an image." }, 400);
      }

      // Keep data URI small for this first test.
      if (!body.image.startsWith("data:image/")) {
        return json({
          error: "Image must be provided as a data URI."
        }, 400);
      }

      if (body.image.length > 1200000) {
        return json({
          error: "Image is too large. Use a smaller image."
        }, 400);
      }

      input.image = body.image;
    } else if (mode !== "text") {
      return json({ error: "Mode must be text or image." }, 400);
    }

    const response = await fetch(
      `https://api.replicate.com/v1/models/${model}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return json({
        error: result.detail || result.error || "AI request failed."
      }, response.status);
    }

    return json({
      id: result.id,
      status: result.status,
      poll_url: `/api/generate?id=${result.id}`
    });
  } catch (error) {
    return json({ error: "Request failed. Please try again." }, 500);
  }
}

export async function onRequestGet({ request, env }) {
  try {
    const token = env.REPLICATE_API_TOKEN;
    const id = new URL(request.url).searchParams.get("id");

    if (!token || !id || !/^[a-z0-9]+$/i.test(id)) {
      return json({ error: "Invalid request." }, 400);
    }

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return json({ error: "Could not check video status." }, response.status);
    }

    return json({
      id: result.id,
      status: result.status,
      output: result.output || null,
      error: result.error || null
    });
  } catch (error) {
    return json({ error: "Status check failed." }, 500);
  }
}

