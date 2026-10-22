(() => {
  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  document.querySelectorAll("[data-activity-identification]").forEach(card => {
    const course = card.dataset.course || "Desenvolvimento de TCC";
    const topic = card.dataset.topic || "Atividade acadêmica";
    const activityTitle = card.dataset.activityTitle || document.title;
    const headerTitle = card.dataset.headerTitle || activityTitle;
    const headerSubtitle = card.dataset.headerSubtitle ||
      course + " • ETEC Hortolândia (1º DSA)";
    const headerIcon = card.dataset.headerIcon || "📝";
    const school = card.dataset.school || "ETEC HORTOLÂNDIA • 1º DSA";
    const defaultClass = card.dataset.defaultClass || "1º DSA - ETEC Hortolândia";

    card.classList.add("identification-card");
    card.innerHTML =
      '<div class="identification-heading">' +
        '<div>' +
          '<span class="identification-school"></span>' +
          '<h2></h2>' +
          '<p class="identification-course"></p>' +
          '<p class="identification-topic"></p>' +
        '</div>' +
        '<div class="identification-year">' +
          '<p class="identification-year-label"></p>' +
          '<p>Professor Victor de Andrade Machado</p>' +
        '</div>' +
      '</div>' +
      '<div class="identification-fields">' +
        '<div><label for="student_name">Nome Completo do Aluno(a):</label>' +
          '<input type="text" id="student_name" placeholder="Digite seu nome completo"></div>' +
        '<div><label for="student_class">Turma / Período:</label>' +
          '<input type="text" id="student_class"></div>' +
        '<div><label for="activity_date">Data de Realização:</label>' +
          '<input type="date" id="activity_date"></div>' +
      '</div>' +
      '<p class="identification-hint">Após responder, clique em “Gerar PDF / Imprimir” e escolha “Salvar como PDF” para enviar sua atividade.</p>';

    card.querySelector(".identification-school").textContent = school;
    card.querySelector(".identification-heading h2").textContent = activityTitle;
    card.querySelector(".identification-course").textContent = "Disciplina: " + course;
    card.querySelector(".identification-topic").textContent = "Tema: " + topic;
    card.querySelector(".identification-year-label").textContent =
      "Ano Letivo " + today.getFullYear();
    card.querySelector("#student_class").value = defaultClass;
    card.querySelector("#activity_date").value = localDate;

    const toolbar = document.createElement("header");
    toolbar.className = "activity-toolbar no-print";
    toolbar.innerHTML =
      '<div class="activity-toolbar-main">' +
        '<div class="activity-toolbar-icon" aria-hidden="true"></div>' +
        '<div><h1></h1><p></p></div>' +
      '</div>' +
      '<div class="activity-toolbar-actions">' +
        '<button class="activity-toolbar-clear" type="button" data-clear-activity>' +
          '<span aria-hidden="true">↶</span> Limpar' +
        '</button>' +
        '<button class="activity-toolbar-pdf" type="button" data-pdf-button>' +
          '<span aria-hidden="true">▣</span> Gerar PDF / Imprimir' +
        '</button>' +
      '</div>';
    toolbar.querySelector(".activity-toolbar-icon").textContent = headerIcon;
    toolbar.querySelector("h1").textContent = headerTitle;
    toolbar.querySelector(".activity-toolbar-main p").textContent = headerSubtitle;
    document.body.insertBefore(toolbar, document.body.firstChild);

    toolbar.querySelector("[data-clear-activity]").addEventListener("click", () => {
      if (!window.confirm("Deseja realmente limpar todas as respostas digitadas?")) return;

      const form = document.querySelector("form[data-pdf-title]");
      if (form) form.reset();
      card.querySelector("#student_name").value = "";

      document.querySelectorAll("textarea.auto-expand").forEach(textarea => {
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
  });
})();
