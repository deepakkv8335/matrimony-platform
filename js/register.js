const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Step 1: Create the account
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    // Make sure a user was created
    if (!data.user) {
        alert("Account created. Please verify your email first.");
        return;
    }

    // Step 2: Create the linked profile
    const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert({
            id: data.user.id,
            full_name: fullName,
            status: "pending"
        });

    if (profileError) {
        console.error(profileError);
        alert(profileError.message);
        return;
    }

    // Step 3: Go to the dashboard
    window.location.href = "dashboard.html";
});