const matchesGrid = document.getElementById("matchesGrid");

async function loadMatches() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data: me, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    if (me.status !== "approved") {
        window.location.href = "verification.html";
        return;
    }

    const oppositeGender = me.gender === "Male" ? "Female" : "Male";

    const { data: matches, error: matchError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("status", "approved")
        .eq("gender", oppositeGender);

    if (matchError) {
        alert(matchError.message);
        return;
    }

    matchesGrid.innerHTML = "";

    if (matches.length === 0) {

        matchesGrid.innerHTML = `
            <div class="empty-card">
                <h3>No matches yet</h3>
                <p>New verified members will appear here.</p>
            </div>
        `;

        return;
    }

    matches.forEach(profile => {

        const card = document.createElement("div");
        card.className = "profile-card";

        card.innerHTML = `
            <img
                src="${profile.photo_url || 'https://placehold.co/300x360?text=No+Photo'}"
                style="width:100%;height:260px;object-fit:cover;border-radius:14px;">

            <h3>${profile.full_name}</h3>

            <p>📍 ${profile.district || "Not specified"}</p>

            <p>🎓 ${profile.education || "Not specified"}</p>

            <p>💼 ${profile.occupation || "Not specified"}</p>

            <button class="approve-btn" onclick="viewProfile('${profile.id}')">
                View Profile
            </button>
        `;

        matchesGrid.appendChild(card);

    });

}

function viewProfile(profileId){

    alert("Full profile page coming next.");

}

loadMatches();