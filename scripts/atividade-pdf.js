(() => {
  const escapeHtml = value => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const controlLabel = control => {
    if (control.id) {
      const label = document.querySelector('label[for="' + CSS.escape(control.id) + '"]');
      if (label) return label.textContent.trim();
    }

    if (control.closest("label")) return control.closest("label").textContent.trim();
    if (control.previousElementSibling?.tagName === "LABEL") {
      return control.previousElementSibling.textContent.trim();
    }

    return "";
  };

  const readAnswers = question => {
    const answers = [];
    const textControls = question.querySelectorAll(
      'textarea, input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"])'
    );

    textControls.forEach(control => {
      const label = controlLabel(control);
      const answer = control.value.trim() || "Não respondida";
      answers.push({ label, answer });
    });

    const radioGroups = new Map();
    question.querySelectorAll('input[type="radio"]').forEach(radio => {
      if (!radioGroups.has(radio.name)) radioGroups.set(radio.name, []);
      radioGroups.get(radio.name).push(radio);
    });

    radioGroups.forEach(group => {
      const selected = group.find(radio => radio.checked);
      const answer = selected
        ? controlLabel(selected) || selected.value
        : "Não respondida";
      answers.push({ label: "", answer });
    });

    const checkboxGroups = new Map();
    question.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      if (!checkboxGroups.has(checkbox.name)) checkboxGroups.set(checkbox.name, []);
      checkboxGroups.get(checkbox.name).push(checkbox);
    });

    checkboxGroups.forEach(group => {
      const selected = group.filter(checkbox => checkbox.checked);
      const answer = selected.length
        ? selected.map(controlLabel).join(", ")
        : "Não respondida";
      answers.push({ label: "", answer });
    });

    return answers;
  };

  const buildQuestion = (question, index) => {
    const prompt = question.querySelector("[data-pdf-prompt], h3, .question p");
    const title = prompt ? prompt.textContent.trim() : "Questão " + (index + 1);
    const answers = readAnswers(question);
    const answerMarkup = answers.length
      ? answers.map(({ label, answer }) =>
          '<div class="answer">' +
          (label ? '<strong>' + escapeHtml(label) + '</strong>' : '') +
          '<p>' + escapeHtml(answer) + '</p></div>'
        ).join("")
      : '<div class="answer"><p>Não respondida</p></div>';

    return '<section class="question"><h2>' + escapeHtml(title) +
      '</h2>' + answerMarkup + '</section>';
  };

  const printActivity = form => {
    const selector = form.dataset.pdfQuestionSelector || "[data-pdf-question]";
    const questions = Array.from(form.querySelectorAll(selector))
      .filter(question => question.querySelector(
        "textarea, input[type=radio], input[type=checkbox], input:not([type=hidden])"
      ));

    if (!questions.length) {
      window.alert("Não foi possível localizar as questões desta atividade.");
      return;
    }

    const studentName = document.getElementById("student_name")?.value.trim();
    const studentClass = document.getElementById("student_class")?.value.trim();
    const activityDate = document.getElementById("activity_date")?.value;
    const identification = document.querySelector("[data-activity-identification]");
    const date = activityDate
      ? new Date(activityDate + "T00:00:00").toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR");
    const title = form.dataset.pdfTitle || document.title;
    const school = identification?.dataset.school || "ETEC HORTOLÂNDIA";
    const course = identification?.dataset.course || "";
    const report = window.open("", "_blank");

    if (!report) {
      window.alert("O navegador bloqueou a janela de impressão. Permita pop-ups para gerar o PDF.");
      return;
    }

    const metadata = [
      ["Instituição", school],
      ...(course ? [["Disciplina", course]] : []),
      ["Aluno(a)", studentName || "________________________________________"],
      ["Turma", studentClass || "________________________________________"],
      ["Data", date]
    ];
    const metadataMarkup = metadata.map(([label, value]) =>
      '<p><strong>' + escapeHtml(label) + ':</strong> ' +
      escapeHtml(value) + '</p>'
    ).join("");

    report.document.open();
    report.document.write(
      '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + escapeHtml(title) + '</title>' +
      '<style>' +
      '@page{margin:18mm}body{font:12pt Arial,sans-serif;color:#263247;line-height:1.5}' +
      'h1{font-size:18pt;color:#1c2c5b;margin:0 0 16px}' +
      '.metadata{border:1px solid #cbd5e1;border-radius:8px;padding:10px 14px;margin-bottom:20px}' +
      '.metadata p{margin:4px 0}.question{border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;margin:0 0 14px;break-inside:avoid}' +
      '.question h2{font-size:12pt;margin:0 0 8px;color:#1c2c5b}' +
      '.answer{margin:8px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}' +
      '.answer p{margin:4px 0 0;min-height:1em}' +
      '</style></head><body><h1>' + escapeHtml(title) + '</h1>' +
      '<div class="metadata">' + metadataMarkup + '</div>' +
      questions.map(buildQuestion).join("") +
      '</body></html>'
    );
    report.document.close();
    report.focus();
    report.print();
  };

  document.querySelectorAll("[data-pdf-button]").forEach(button => {
    const form = button.form || button.closest("form") ||
      document.querySelector("form[data-pdf-title]");
    if (!form) {
      window.console.error("Botão de PDF precisa estar dentro de um formulário.");
      return;
    }

    button.addEventListener("click", () => printActivity(form));
  });
})();
