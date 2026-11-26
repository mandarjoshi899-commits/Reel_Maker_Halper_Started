
let mode = "text";
let selectedPhoto = null;

const $ = id => document.getElementById(id);

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;

    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.toggle("active", tab === button);
    });

    $("textBox").hidden = mode !== "text";
    $("imageBox").hidden = mode !== "image";
    $("download").hidden = true;
  });
});

$("photo").addEventListener("change", () => {
  selectedPhoto = $("photo").files[0] || null;
  $("preview").hidden = true;

  if (!selectedPhoto) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(selectedPhoto.type)) {
    $("status").textContent = "Choose JPG, PNG or WebP.";
    selectedPhoto = null;
    return;
  }

  if (selectedPhoto.size > 800000) {
    $("status").textContent = "For this test, choose a photo under 800 KB.";
    selectedPhoto = null;
    return;
  }

  $("preview").src = URL.createObjectURL(selectedPhoto);
  $("preview").hidden = false;
});

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function checkVideo(jobId) {
  for (let i = 0; i < 100; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const response = await fetch(
      "/api/generate?id=" + encodeURIComponent(jobId)
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Status check failed.");
    }

    $("status").textContent = "AI video status: " + result.status;

    if (result.status === "succeeded") {
      return Array.isArray(result.output)
        ? result.output[0]
        : result.output;
    }

    if (result.status === "failed" || result.status === "canceled") {
      throw new Error(result.error || "AI video failed.");
    }
  }

  throw new Error("Video is taking too long. Try again later.");
}

$("make").textContent = "Generate AI Video";

$("make").addEventListener("click", async () => {
  const button = $("make");
  const status = $("status");
  $("download").hidden = true;

  const prompt = mode === "text"
    ? $("prompt").value.trim()
    : $("motion").value.trim();

  if (mode === "text" && prompt.length < 5) {
    status.textContent = "Please enter a video prompt.";
    return;
  }

  if (mode === "image" && !selectedPhoto) {
    status.textContent = "Please select a photo.";
    return;
  }

  button.disabled = true;

  try {
    status.textContent = "Sending request to AI...";

    const body = { mode, prompt };

    if (mode === "image") {
      body.image = await fileToDataURL(selectedPhoto);
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const job = await response.json();

    if (!response.ok) {
      throw new Error(job.error || "AI request failed.");
    }

    if (!job.id) {
      throw new Error("AI job ID was not returned.");
    }

    status.textContent = "AI is generating your video...";

    const videoURL = await checkVideo(job.id);

    if (!videoURL) {
      throw new Error("Video link was not returned.");
    }

    let video = document.getElementById("aiVideo");

    if (!video) {
      video = document.createElement("video");
      video.id = "aiVideo";
      video.controls = true;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.borderRadius = "12px";
      $("download").before(video);
    }

    video.src = videoURL;
    video.hidden = false;
    video.load();

    const download = $("download");
    download.href = videoURL;
    download.textContent = "Download AI Video";
    download.hidden = false;

    status.textContent = "Your AI video is ready!";
  } catch (error) {
    status.textContent = error.message || "Something went wrong.";
  } finally {
    button.disabled = false;
  }
});
 
