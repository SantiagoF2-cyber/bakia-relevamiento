document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("relevamientoForm");

  if (!form) return;

  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");
  const progressBar = document.getElementById("progressBar");

  const resetBtn = document.getElementById("resetBtn");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");

  const STORAGE_KEY = "bakia_relevamiento_draft_v2";

  const questions = Array.from(
    form.querySelectorAll(
      ".question input, .question textarea, .question select"
    )
  );

  const editableFields = Array.from(
    form.querySelectorAll(
      "input:not([type='hidden']):not([name='_honey']), textarea, select"
    )
  );

  const totalQuestions = questions.length;

  let submitting = false;

  // PROGRESO

  function updateProgress() {

    const completed = questions.filter((field) => {
      return field.value.trim() !== "";
    }).length;

    const percentage = totalQuestions
      ? Math.round((completed / totalQuestions) * 100)
      : 0;

    progressText.textContent = `${completed} de ${totalQuestions}`;

    progressFill.style.width = `${percentage}%`;

    progressBar.setAttribute("aria-valuemax", totalQuestions);
    progressBar.setAttribute("aria-valuenow", completed);

  }

  // GUARDADO LOCAL

  function saveDraft() {

    const data = {};

    editableFields.forEach((field) => {
      if (field.id) {
        data[field.id] = field.value;
      }
    });

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );

    } catch (error) {

      console.warn(
        "No se pudo guardar el borrador:",
        error
      );

    }

  }

  // RESTAURAR BORRADOR

  function restoreDraft() {

    try {

      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const data = JSON.parse(saved);

      editableFields.forEach((field) => {

        const value = data[field.id];

        if (typeof value === "string") {
          field.value = value;
        }

      });

    } catch (error) {

      console.warn(
        "No se pudo restaurar el borrador:",
        error
      );

    }

  }

  // EVENTOS DE LOS CAMPOS

  editableFields.forEach((field) => {

    field.addEventListener("input", () => {

      updateProgress();
      saveDraft();

      formMessage.textContent = "";

    });

    field.addEventListener("change", () => {

      updateProgress();
      saveDraft();

    });

  });

  // REINICIAR FORMULARIO

  resetBtn.addEventListener("click", () => {

    const confirmed = window.confirm(
      "¿Querés borrar todas las respuestas del formulario?"
    );

    if (!confirmed) return;

    form.reset();

    try {

      localStorage.removeItem(STORAGE_KEY);

    } catch (error) {

      console.warn(error);

    }

    updateProgress();

    formMessage.textContent =
      "Se borraron las respuestas guardadas.";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

  // RESTABLECER BOTÓN DE ENVÍO

  function restoreSubmitButton() {

    submitting = false;

    submitBtn.disabled = false;
    resetBtn.disabled = false;

    submitBtn.innerHTML =
      'Enviar relevamiento <span aria-hidden="true">→</span>';

  }

  // VALIDACIÓN Y ENVÍO

  form.addEventListener("submit", (event) => {

    if (submitting) {

      event.preventDefault();
      return;

    }

    formMessage.textContent = "";

    const nombre = document.getElementById("nombre");

    if (!nombre.value.trim()) {

      event.preventDefault();

      formMessage.textContent =
        "Por favor, completá tu nombre y apellido.";

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

    // Conservamos el borrador hasta que se complete el envío.

    saveDraft();

    submitting = true;

    submitBtn.disabled = true;
    resetBtn.disabled = true;

    submitBtn.textContent = "Enviando...";

    formMessage.textContent =
      "Estamos procesando tus respuestas. Por favor, aguardá.";

    // Permitir reintentar si la navegación no se completa.

    window.setTimeout(() => {

      restoreSubmitButton();

      formMessage.textContent =
        "Si el envío no se completó, verificá tu conexión antes de reintentar.";

    }, 20000);

  });

  // RESTAURAR BOTÓN AL VOLVER A LA PÁGINA

  window.addEventListener("pageshow", () => {

    restoreSubmitButton();

    formMessage.textContent = "";

  });

  // INICIALIZACIÓN

  restoreDraft();
  updateProgress();

});
