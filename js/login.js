const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    // Check if this user is an admin
    const { data: admin } = await supabaseClient
        .from("admins")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

    if (admin) {
        window.location.href = "admin.html";
        return;
    }

    // Normal member flow
    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .single();

    if (profileError) {
        alert(profileError.message);
        return;
    }

    if (profile.status === "approved") {
        window.location.href = "matches.html";
    } else {
        window.location.href = "verification.html";
    }
});