async function uploadProfilePhoto(userId) {

    const fileInput = document.getElementById("profilePhoto");

    if (!fileInput.files.length) {
        return null;
    }

    const file = fileInput.files[0];
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { error } = await supabaseClient.storage
        .from("profile-photos")
        .upload(filePath, file);

    if (error) {
        alert(error.message);
        return null;
    }

    const { data } = supabaseClient.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

    document.getElementById("profilePreview").src = data.publicUrl;

    return data.publicUrl;
}

async function loadProfile() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Admins go to admin panel
    const { data: admin } = await supabaseClient
        .from("admins")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

    if (admin) {
        window.location.href = "admin.html";
        return;
    }

    // Load member profile
    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    // Approved users skip dashboard
    if (profile.status === "approved") {
        window.location.href = "matches.html";
        return;
    }

    // Submitted users wait on verification page
    if (profile.status === "pending" && profile.submitted_for_review) {
        window.location.href = "verification.html";
        return;
    }

    // Pre-fill form
    document.getElementById("full_name").value = profile.full_name || "";
    document.getElementById("gender").value = profile.gender || "";
    document.getElementById("district").value = profile.district || "";
    document.getElementById("education").value = profile.education || "";
    document.getElementById("occupation").value = profile.occupation || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("height_cm").value = profile.height_cm || "";
    document.getElementById("marital_status").value = profile.marital_status || "";
    document.getElementById("father_name").value = profile.father_name || "";
    document.getElementById("mother_name").value = profile.mother_name || "";
    document.getElementById("bio").value = profile.bio || "";

    if (profile.dob) {
        document.getElementById("dob").value = profile.dob;
    }

    if (profile.photo_url) {
        document.getElementById("profilePreview").src = profile.photo_url;
    }

    // Save profile
    document.getElementById("profileForm").addEventListener("submit", async (e) => {

        e.preventDefault();

        const photoUrl = await uploadProfilePhoto(user.id);

        const { error } = await supabaseClient
            .from("profiles")
            .update({
                full_name: document.getElementById("full_name").value.trim(),
                gender: document.getElementById("gender").value,
                dob: document.getElementById("dob").value,
                district: document.getElementById("district").value.trim(),
                education: document.getElementById("education").value.trim(),
                occupation: document.getElementById("occupation").value.trim(),
                phone: document.getElementById("phone").value.trim(),
                height_cm: Number(document.getElementById("height_cm").value),
                marital_status: document.getElementById("marital_status").value,
                father_name: document.getElementById("father_name").value.trim(),
                mother_name: document.getElementById("mother_name").value.trim(),
                bio: document.getElementById("bio").value.trim(),
                photo_url: photoUrl || profile.photo_url,
                status: "pending",
                submitted_for_review: true
            })
            .eq("id", user.id);

        if (error) {
            alert(error.message);
            return;
        }

        window.location.href = "verification.html";
    });

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
    });

}

loadProfile();