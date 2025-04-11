async function loadEmails() {
  try {
    const response = await fetch('email_dataset.json');
    const emails = await response.json();

    const outputDiv = document.getElementById('output');
    outputDiv.innerText = `Email caricate: ${emails.length}\n\n`;

    // Visualizza le prime 3 email come esempio
    emails.slice(0, 3).forEach((email, i) => {
      outputDiv.innerText += `#${i + 1}\n`;
      outputDiv.innerText += `Da: ${email.from}\nA: ${email.to}\nOggetto: ${email.subject}\n\n${email.body}\n\n---\n\n`;
    });

    window.emails = emails; // Salvo per uso successivo
  } catch (error) {
    alert("Errore nel caricamento del file: " + error.message);
  }
}



let modelLoaded = false;
let embedder;
let emailEmbeddings = [];

async function handleQuestion() {
  const question = document.getElementById('question').value.trim();
  const outputDiv = document.getElementById('output');

  if (!question) {
    outputDiv.innerText = "Inserisci una domanda per avviare la ricerca.";
    return;
  }

  if (!window.emails || window.emails.length === 0) {
    outputDiv.innerText = "Carica prima le email.";
    return;
  }

  outputDiv.innerText = "Sto pensando...";

  // Carica il modello solo una volta
  if (!modelLoaded) {
    embedder = await window.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    modelLoaded = true;

    // Calcola embedding delle email
    for (const email of window.emails) {
      const fullText = (email.subject + ' ' + email.body).slice(0, 512);
      const result = await embedder(fullText);
      email.embedding = averageVector(result.data[0]);
    }
  }

  // Calcola embedding della domanda
  const result = await embedder(question.slice(0, 512));
  const questionEmbedding = averageVector(result.data[0]);

  // Calcola similarità tra la domanda e tutte le email
  const scored = window.emails.map(email => {
    return {
      ...email,
      score: cosineSimilarity(questionEmbedding, email.embedding)
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  outputDiv.innerText = `Domanda: "${question}"\n\nRisultati:\n\n`;
  top.forEach((email, i) => {
    outputDiv.innerText += `#${i + 1} (similitudine: ${email.score.toFixed(3)})\n`;
    outputDiv.innerText += `Da: ${email.from}\nOggetto: ${email.subject}\n\n${email.body.slice(0, 300)}\n...\n\n---\n\n`;
  });
}



window.loadEmails = loadEmails;
window.handleQuestion = handleQuestion;

function averageVector(vectors) {
  const dim = vectors[0].length;
  const avg = new Array(dim).fill(0);

  vectors.forEach(vec => {
    for (let i = 0; i < dim; i++) {
      avg[i] += vec[i];
    }
  });

  return avg.map(x => x / vectors.length);
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}
