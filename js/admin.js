const pendingContainer = document.getElementById("pendingProfiles");

async function loadAdminPanel() {

    // Check logged in user
    const { data: { user } } = await supabaseClient.auth.getUser();

    console.log("Logged in user:", user.id);

    if (!user) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    // Check admin table
    const { data: admin, error } = await supabaseClient
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .single();
    
    console.log("Admin query result:", admin, error);

    if (error || !admin) {
        document.body.innerHTML = "<h2>Access Denied</h2>";
        return;
    }

    // If admin, load pending profiles
    loadPendingProfiles();
}

loadAdminPanel();

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
        pendingContainer.innerHTML = "<p>No pending profiles.</p>";
        return;
    }

    profiles.forEach(profile => {

        const card = document.createElement("div");

        card.innerHTML = `
            <div style="border:1px solid #ddd;padding:20px;border-radius:12px;margin-bottom:15px;">
                <h3>${profile.full_name || "Unnamed User"}</h3>
                <p>Phone: ${profile.phone || "Not provided"}</p>
                <p>District: ${profile.district || "Not provided"}</p>

                <button onclick="approveProfile('${profile.id}')">
                    Approve
                </button>
            </div>
        `;

        pendingContainer.appendChild(card);

    });

}async function approveProfile(profileId) {

    const { error } = await supabaseClient
        .from("profiles")
        .update({ status: "approved" })
        .eq("id", profileId);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Profile approved!");

    loadPendingProfiles();

}