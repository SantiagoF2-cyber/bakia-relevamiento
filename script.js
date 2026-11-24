document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("relevamientoForm");
  const key = "bakia_relevamiento_draft_v2";
  const fields = [
    ...form.querySelectorAll("input[id], textarea[id], select[id]"),
  ];
  const questions = [
    ...form.querySelectorAll(
      ".question textarea, .question select, .question input",
    ),
  ];
  const button = document.getElementById("submitBtn");
  const message = document.getElementById("formMessage");
  const count = () => questions.filter((f) => f.value.trim()).length;
  function update() {
    const n = count();
    document.getElementById("progressText").textContent =
      `${n} de ${questions.length}`;
    document.getElementById("progressFill").style.width =
      `${(100 * n) / questions.length}%`;
    document.getElementById("progressBar").setAttribute("aria-valuenow", n);
  }
  function save() {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(Object.fromEntries(fields.map((f) => [f.id, f.value]))),
      );
    } catch (e) {
      console.warn(e);
    }
  }
  try {
    const draft = JSON.parse(localStorage.getItem(key) || "{}");
    fields.forEach((f) => {
      if (typeof draft[f.id] === "string") f.value = draft[f.id];
    });
  } catch (e) {
    console.warn(e);
  }
  form.addEventListener("input", () => {
    update();
    save();
  });
  form.addEventListener("change", () => {
    update();
    save();
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("¿Querés borrar todas las respuestas?")) return;
    form.reset();
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    update();
    message.textContent = "Se borraron las respuestas guardadas.";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  form.addEventListener("submit", (e) => {
    message.textContent = "";
    if (!document.getElementById("nombre").value.trim() || !count()) {
      e.preventDefault();
      message.textContent = "Completá tu nombre y al menos una pregunta.";
      return;
    }
    save();
    button.disabled = true;
    button.textContent = "Enviando...";
  });
  window.addEventListener("pageshow", () => {
    button.disabled = false;
    button.textContent = "Enviar relevamiento →";
  });
  update();
});
