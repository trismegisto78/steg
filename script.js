export async function loadEmails() {
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
