document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("relevamientoForm");

  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");
  const progressBar = document.getElementById("progressBar");

  const resetBtn = document.getElementById("resetBtn");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");

  const STORAGE_KEY = "bakia_relevamiento_draft_v1";

  const questions = Array.from(
    form.querySelectorAll(
      ".question input, .question textarea, .question select",
    ),
  );

  const totalQuestions = questions.length;

  // PROGRESO

  function updateProgress() {
    const completed = questions.filter((field) => {
      return field.value.trim() !== "";
    }).length;

    const percentage = Math.round((completed / totalQuestions) * 100);

    progressText.textContent = `${completed} de ${totalQuestions}`;

    progressFill.style.width = `${percentage}%`;

    progressBar.setAttribute("aria-valuenow", completed);
  }

  // GUARDADO LOCAL

  function saveDraft() {
    const data = {};

    const fields = form.querySelectorAll(
      "input:not([type='hidden']), textarea, select",
    );

    fields.forEach((field) => {
      if (field.id) {
        data[field.id] = field.value;
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("No se pudo guardar el borrador:", error);
    }
  }

  // RESTAURAR BORRADOR

  function restoreDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const data = JSON.parse(saved);

      Object.entries(data).forEach(([id, value]) => {
        const field = document.getElementById(id);

        if (!field) return;

        if (typeof value === "string") {
          field.value = value;
        }
      });
    } catch (error) {
      console.warn("No se pudo restaurar el borrador:", error);
    }
  }

  // EVENTOS DE LOS CAMPOS

  const editableFields = form.querySelectorAll(
    "input:not([type='hidden']), textarea, select",
  );

  editableFields.forEach((field) => {
    field.addEventListener("input", () => {
      updateProgress();
      saveDraft();
    });

    field.addEventListener("change", () => {
      updateProgress();
      saveDraft();
    });
  });

  // REINICIAR FORMULARIO

  resetBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      "¿Querés borrar todas las respuestas del formulario?",
    );

    if (!confirmed) return;

    form.reset();

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn(error);
    }

    updateProgress();

    formMessage.textContent = "Se borraron las respuestas guardadas.";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // VALIDACIÓN Y ENVÍO

  form.addEventListener("submit", (event) => {
    formMessage.textContent = "";

    const nombre = document.getElementById("nombre");

    if (!nombre.value.trim()) {
      event.preventDefault();

      formMessage.textContent = "Por favor, completá tu nombre y apellido.";

      nombre.focus();
      return;
    }

    const completed = questions.filter((field) => {
      return field.value.trim() !== "";
    }).length;

    if (completed === 0) {
      event.preventDefault();

      formMessage.textContent =
        "Completá al menos una pregunta antes de enviar.";

      questions[0].focus();
      return;
    }

    // El envío se realiza mediante el formulario HTML.
    // FormSubmit procesa los datos y muestra su confirmación.
    // No borramos el borrador automáticamente porque todavía
    // no sabemos si el servidor recibió la información.

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    // Si la página no llega a navegar, permitimos reintentar.
    window.addEventListener(
      "pageshow",
      () => {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          'Enviar relevamiento <span aria-hidden="true">→</span>';
      },
      { once: true },
    );
  });

  // INICIALIZACIÓN

  restoreDraft();
  updateProgress();
});
