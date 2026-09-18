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

    const { data } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (data) {
        document.getElementById("full_name").value = data.full_name || "";
        document.getElementById("gender").value = data.gender || "";
        document.getElementById("district").value = data.district || "";
        document.getElementById("education").value = data.education || "";
        document.getElementById("occupation").value = data.occupation || "";
        document.getElementById("phone").value = data.phone || "";
        document.getElementById("height_cm").value = data.height_cm || "";
        document.getElementById("marital_status").value = data.marital_status || "";
        document.getElementById("father_name").value = data.father_name || "";
        document.getElementById("mother_name").value = data.mother_name || "";
        document.getElementById("bio").value = data.bio || "";

        if (data.dob)
            document.getElementById("dob").value = data.dob;
        if (data.photo_url) {
            document.getElementById("profilePreview").src = data.photo_url;
        }

    }

    document.getElementById("profileForm").addEventListener("submit", async (e) => {

        e.preventDefault();

        const photoUrl = await uploadProfilePhoto(user.id);

        const { error } = await supabaseClient
            .from("profiles")
            .update({
                full_name: document.getElementById("full_name").value,
                gender: document.getElementById("gender").value,
                dob: document.getElementById("dob").value,
                district: document.getElementById("district").value,
                education: document.getElementById("education").value,
                occupation: document.getElementById("occupation").value,
                phone: document.getElementById("phone").value,
                height_cm: Number(document.getElementById("height_cm").value),
                marital_status: document.getElementById("marital_status").value,
                father_name: document.getElementById("father_name").value,
                mother_name: document.getElementById("mother_name").value,
                bio: document.getElementById("bio").value,
                photo_url: photoUrl || data?.photo_url
            })
            .eq("id", user.id);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Profile updated successfully!");
    });

    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
    });

}

loadProfile();