// Set this to your deployed HTTPS backend URL. Do not put AI provider keys here.
const API_BASE = ""; // Example: "https://your-api.example.com"
let mode = "text";
const $ = (id) => document.getElementById(id);
const tabs = document.querySelectorAll(".tab");

tabs.forEach((tab) => tab.addEventListener("click", () => {
  mode = tab.dataset.mode;
  tabs.forEach(t => t.classList.toggle("active", t === tab));
  $("textPanel").hidden = mode !== "text";
  $("imagePanel").hidden = mode !== "image";
  $("status").textContent = "Selected: " + (mode === "text" ? "Text to Video" : "Image to Video");
}));

$("prompt").addEventListener("input", () => $("charCount").textContent = `${$("prompt").value.length} / 1800`);
$("ideaBtn").addEventListener("click", () => {
  const ideas = [
    "A 15-second uplifting story: a student helps a stranger, and discovers that kindness comes back in unexpected ways.",
    "A funny 10-second moment where a clever puppy misunderstands a simple instruction.",
    "A cinematic sunrise journey through a quiet village, ending with an inspiring message."
  ];
  $("prompt").value = ideas[Math.floor(Math.random() * ideas.length)];
  $("prompt").dispatchEvent(new Event("input"));
});

$("imageFile").addEventListener("change", () => {
  const file = $("imageFile").files[0];
  $("preview").hidden = true;
  if (!file) return;
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type) || file.size > 8 * 1024 * 1024) {
    $("status").textContent = "Please select JPG, PNG or WebP under 8 MB.";
    $("imageFile").value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => { $("preview").src = reader.result; $("preview").hidden = false; };
  reader.readAsDataURL(file);
});

$("generateBtn").addEventListener("click", async () => {
  const status = $("status");
  if (!API_BASE) {
    status.textContent = "Demo mode: backend URL is not configured yet. Real AI generation is not active. See README_HINDI.txt.";
    return;
  }
  const form = new FormData();
  form.append("duration", $("duration").value);
  form.append("aspectRatio", $("ratio").value);
  if (mode === "text") {
    const prompt = $("prompt").value.trim();
    if (prompt.length < 8) { status.textContent = "Please enter a more detailed video idea."; return; }
    form.append("prompt", prompt);
  } else {
    const file = $("imageFile").files[0];
    if (!file) { status.textContent = "Please choose an image first."; return; }
    form.append("image", file);
    form.append("motion", $("motion").value.trim());
  }
  try {
    status.textContent = "Sending request securely…";
    const response = await fetch(`${API_BASE}/api/video/${mode}`, { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Generation service is not configured.");
    status.textContent = data.message || "Request accepted. Check your project status with the configured provider.";
  } catch (error) {
    status.textContent = error.message || "Could not connect to the video service.";
  }
});
