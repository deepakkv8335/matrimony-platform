const connectionsList = document.getElementById("connectionsList");

async function loadConnections(){

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
        .eq("status","accepted");

    if(error){
        alert(error.message);
        return;
    }

    connectionsList.innerHTML="";

    const myConnections = interests.filter(i =>
        i.sender_id===user.id || i.receiver_id===user.id
    );

    if(myConnections.length===0){

        connectionsList.innerHTML=
        `<div class="empty">
            No connections yet.
        </div>`;

        return;
    }

    for(const interest of myConnections){

        const otherUserId =
            interest.sender_id===user.id
            ? interest.receiver_id
            : interest.sender_id;

        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id",otherUserId)
            .single();

        const card=document.createElement("div");

        card.className="connection-card";

        card.innerHTML=`

            <div class="connection-info">

                <img
                    src="${profile.photo_url || 'https://placehold.co/80x80'}"
                    class="connection-photo">

                <div>
                    <h3>${profile.full_name}</h3>
                    <p>${profile.education || "-"}</p>
                    <p>${profile.district || "-"}</p>
                </div>

            </div>

            <button
                class="chat-btn"
                onclick="openChat('${otherUserId}')">
                Open Chat
            </button>

        `;

        connectionsList.appendChild(card);

    }

}

function openChat(userId){

    window.location.href=`chat.html?user=${userId}`;

}

loadConnections();