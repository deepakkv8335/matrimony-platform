const pendingContainer = document.getElementById("pendingProfiles");

// ==========================
// Load Admin Panel
// ==========================

async function loadAdminPanel() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const { data: admin, error } = await supabaseClient
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error || !admin) {
        document.body.innerHTML = "<h2 style='text-align:center;margin-top:100px;'>Access Denied</h2>";
        return;
    }

    await loadStats();
    await loadPendingProfiles();
}

loadAdminPanel();

// ==========================
// Dashboard Statistics
// ==========================

async function loadStats() {

    const { count: pending } = await supabaseClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    const { count: approved } = await supabaseClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

    const { count: total } = await supabaseClient
        .from("profiles")
        .select("*", { count: "exact", head: true });

    document.getElementById("pendingCount").textContent = pending || 0;
    document.getElementById("approvedCount").textContent = approved || 0;
    document.getElementById("totalCount").textContent = total || 0;
}

// ==========================
// Load Pending Profiles
// ==========================

async function loadPendingProfiles() {

    const { data: profiles, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("status", "pending");

    if (error) {
        alert(error.message);
        return;
    }

    pendingContainer.innerHTML = "";

    if (profiles.length === 0) {
        pendingContainer.innerHTML =
            `<div class="empty-card">No pending profiles.</div>`;
        return;
    }

    profiles.forEach(profile => {

        const card = document.createElement("div");
        card.className = "profile-card";

        card.innerHTML = `
            <div>
                <h3>${profile.full_name || "Unnamed User"}</h3>
                <p>📞 ${profile.phone || "Not provided"}</p>
                <p>📍 ${profile.district || "Not provided"}</p>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="approve-btn" onclick="approveProfile('${profile.id}')">
                Approve
                </button>

                <button class="reject-btn" onclick="rejectProfile('${profile.id}')">
                Reject
                </button>
            </div>

        `;

        pendingContainer.appendChild(card);

    });
}

// ==========================
// Approve Profile
// ==========================

async function approveProfile(profileId) {

    const { error } = await supabaseClient
        .from("profiles")
        .update({ status: "approved" })
        .eq("id", profileId);

    if (error) {
        alert(error.message);
        return;
    }

    await loadStats();
    await loadPendingProfiles();
}

async function rejectProfile(profileId) {

    const { error } = await supabaseClient
        .from("profiles")
        .update({ status: "rejected" })
        .eq("id", profileId);

    if (error) {
        alert(error.message);
        return;
    }

    await loadStats();
    await loadPendingProfiles();
}
// ==========================
// Logout
// ==========================

document.getElementById("logoutBtn").addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";

});