const interestList = document.getElementById("interestList");

async function loadIncomingInterests(){

    const { data:{ user } } = await supabaseClient.auth.getUser();

    if(!user){
        window.location.href="login.html";
        return;
    }

    // Block admins
    const { data: admin } = await supabaseClient
        .from("admins")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

    if (admin) {
        window.location.href = "admin.html";
        return;
    }

    const { data: interests, error } = await supabaseClient
        .from("interests")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status","pending");

    if(error){
        alert(error.message);
        return;
    }

    interestList.innerHTML="";

    if(interests.length===0){

        interestList.innerHTML=
        `<div class="empty">
            No incoming interests yet.
        </div>`;

        return;
    }

    for(const interest of interests){

        const { data: sender } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id",interest.sender_id)
            .single();

        const card=document.createElement("div");

        card.className="interest-card";

        card.innerHTML=`
            <div>
                <h3>${sender.full_name}</h3>
                <p>${sender.education || "-"}</p>
                <p>${sender.district || "-"}</p>
            </div>

            <div class="actions">

                <button class="decline-btn"
                    onclick="updateInterest('${interest.id}','declined')">
                    Decline
                </button>

                <button class="accept-btn"
                    onclick="updateInterest('${interest.id}','accepted')">
                    Accept ❤️
                </button>

            </div>
        `;

        interestList.appendChild(card);

    }

}

async function updateInterest(id,status){

    const { error } = await supabaseClient
        .from("interests")
        .update({status})
        .eq("id",id);

    if(error){
        alert(error.message);
        return;
    }

    loadIncomingInterests();

}

loadIncomingInterests();