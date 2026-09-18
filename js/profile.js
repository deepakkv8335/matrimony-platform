const params = new URLSearchParams(window.location.search);
const profileId = params.get("id");

async function loadProfile() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

    if (error || !profile) {
        alert("Profile not found.");
        return;
    }

    document.getElementById("profileName").textContent = profile.full_name;
    document.getElementById("profileDistrict").textContent = profile.district || "-";
    document.getElementById("profileEducation").textContent = profile.education || "-";
    document.getElementById("profileOccupation").textContent = profile.occupation || "-";
    document.getElementById("profileMarital").textContent = profile.marital_status || "-";
    document.getElementById("profileHeight").textContent =
        profile.height_cm ? profile.height_cm + " cm" : "-";
    document.getElementById("profileBio").textContent = profile.bio || "-";

    if (profile.photo_url) {
        document.getElementById("profilePhoto").src = profile.photo_url;
    }

}

loadProfile();

document.getElementById("interestBtn").addEventListener("click", sendInterest);

async function sendInterest() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) return;

    if (user.id === profileId) {
        alert("You can't send interest to yourself.");
        return;
    }

    const { data: existing } = await supabaseClient
        .from("interests")
        .select("id")
        .eq("sender_id", user.id)
        .eq("receiver_id", profileId)
        .maybeSingle();

    if (existing) {
        alert("Interest already sent.");
        return;
    }

    const { error } = await supabaseClient
        .from("interests")
        .insert({
            sender_id: user.id,
            receiver_id: profileId,
            status: "pending"
        });

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("interestBtn").textContent = "Interest Sent ❤️";
    document.getElementById("interestBtn").disabled = true;

}