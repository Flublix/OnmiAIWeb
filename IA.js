const chatBox = document.getElementById("chatBox");
const messages = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");

// Charger l'historique local au démarrage
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.forEach(message => appendMessage(message.content, message.sender));
}

// Sauvegarder l'historique local
function saveMessage(sender, content) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ sender, content });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

// Ajouter un message à l'interface
function appendMessage(content, className) {
  const messageDiv = document.createElement("div");
  messageDiv.className = className;
  messageDiv.textContent = content;
  messages.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Gérer l'envoi de messages
function sendMessage(userMessage) {
  appendMessage(userMessage, "user-message");
  saveMessage("user-message", userMessage);
  userInput.value = "";

  // Vérifie si le message doit déclencher une recherche
  if (userMessage.toLowerCase().startsWith("search ")) {
    const query = userMessage.slice(7); // Retire le mot "search " pour garder la requête
    performSearch(query);
  } else {
    const aiResponse = getAIResponse(userMessage);
    appendMessage(aiResponse, "bot-message");
    saveMessage("bot-message", aiResponse);
  }
}

// Effectuer une recherche avec l'API Wikipedia
function performSearch(query) {
  const encodedQuery = encodeURIComponent(query);
  const script = document.createElement("script");
  script.src = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*&callback=handleSearchResult`;
  document.body.appendChild(script);

  // Affiche un message d'attente
  appendMessage("Searching Wikipedia, please wait...", "bot-message");
}

// Traiter les résultats de recherche
function handleSearchResult(data) {
  const searchResults = data.query?.search || [];
  if (searchResults.length > 0) {
    const firstResult = searchResults[0];
    const botResponse = `Result: ${firstResult.title} - ${firstResult.snippet.replace(/<[^>]+>/g, '')}...`;
    appendMessage(botResponse, "bot-message");
    saveMessage("bot-message", botResponse);
  } else {
    const noResultResponse = "I couldn't find anything relevant on Wikipedia. Try a different query.";
    appendMessage(noResultResponse, "bot-message");
    saveMessage("bot-message", noResultResponse);
  }
}

// Réponse locale basée sur des règles
function getAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.includes("hello")) return "Hi there! How can I assist?";
  if (lowerMessage.includes("bye")) return "Goodbye! Take care.";
  if (lowerMessage.includes("your name")) return "I'm Chat AI Buddy!";
  return "Sorry, I didn't understand that. Could you rephrase?";
}

sendButton.addEventListener("click", () => {
  const userMessage = userInput.value.trim();
  if (userMessage) sendMessage(userMessage);
});

// Charger l'historique local
loadHistory();
