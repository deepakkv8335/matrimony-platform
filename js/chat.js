const params = new URLSearchParams(window.location.search);
const otherUserId = params.get("user");

const messagesBox = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");

let currentUser;
const displayedMessages = new Set();
let channel = null;

// Load chat
async function loadChat() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("id", otherUserId)
        .single();

    if (error || !profile) {
        alert("User not found.");
        window.location.href = "connections.html";
        return;
    }

    document.getElementById("chatName").textContent = profile.full_name;

    await loadMessages();
    subscribeRealtime();
}

// Load existing messages
async function loadMessages() {

    const { data: messages, error } = await supabaseClient
        .from("messages")
        .select("*")
        .in("sender_id", [currentUser.id, otherUserId])
        .in("receiver_id", [currentUser.id, otherUserId])
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    messagesBox.innerHTML = "";
    displayedMessages.clear();

    messages.forEach(addMessage);

    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Add one message to screen
function addMessage(message) {

    if (displayedMessages.has(message.id)) return;

    displayedMessages.add(message.id);

    const div = document.createElement("div");

    div.className =
        "message " +
        (message.sender_id === currentUser.id ? "sent" : "received");

    div.textContent = message.message;

    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Send message
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const text = input.value.trim();

    if (!text) return;

    const { data, error } = await supabaseClient
        .from("messages")
        .insert({
            sender_id: currentUser.id,
            receiver_id: otherUserId,
            message: text
        })
        .select()
        .single();

    if (error) {
        alert(error.message);
        console.error(error);
        return;
    }

    input.value = "";

    // Show instantly on sender's screen
    addMessage(data);
});

// Live updates
let pollInterval;
let loadingMessages = false;

function subscribeRealtime() {

    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {

        if (loadingMessages) return;

        loadingMessages = true;
        await loadMessages();
        loadingMessages = false;

    }, 500);

}

loadChat();

// Stop polling when leaving the page
window.addEventListener("beforeunload", () => {
    if (pollInterval) clearInterval(pollInterval);
});