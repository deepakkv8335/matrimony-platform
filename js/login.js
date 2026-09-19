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

    // Admin goes to admin panel
    const { data: admin } = await supabaseClient
        .from("admins")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

    if (admin) {
        window.location.href = "admin.html";
        return;
    }

    // Every member goes to dashboard
    window.location.href = "dashboard.html";
});