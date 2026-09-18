async function checkVerification() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    if (profile.status === "approved") {
        window.location.href = "matches.html";
        return;
    }

    if (profile.status === "rejected") {

        document.querySelector(".verify-icon").textContent = "❌";
        document.querySelector("h1").textContent = "Profile Not Approved";

        document.querySelector(".note").textContent =
            "Please contact support for more information.";

        document.getElementById("statusText").textContent = "Rejected";
    }

}

checkVerification();

setInterval(checkVerification, 10000);