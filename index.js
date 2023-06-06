const { readFile, writeFile } = require("fs").promises;
const { Client } = require("fnbr");
const { writeFileSync } = require("fs");

(async () => {
    let auth;
    try {
        auth = { deviceAuth: JSON.parse(await readFile("./deviceAuth.json")), killOtherTokens: false };
    } catch (e) {
        auth = { authorizationCode: async () => Client.consoleQuestion("Please enter an authorization code: "), killOtherTokens: false };
    }
    s = await Client.consoleQuestion("Enter a status you would like to be on your Fortnite Profile: ")

    const client = new Client({
        auth,
        forceNewParty: false,
        createParty: false,
        connectToXMPP: false,
        defaultStatus: s,
        defaultOnlineType: "online"
    });
    client.on("deviceauth:created", (da) => writeFile("./deviceAuth.json", JSON.stringify(da, null, 2)));
    client.on("ready", () => console.log(`Logged in as ${client.user.displayName}`));
    await client.login();
    async function getRawProfile(id, profile) {
        const endpoint = `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${id}/client/QueryProfile?profileId=${profile}&rvn=-1`;
        const response = await client.http.sendEpicgamesRequest(true, "POST", endpoint, "fortnite", { "Content-Type": "application/json" }, {});
        if (response.error) throw response.error;
        return response.response;
    }

    d = await getRawProfile(`${client.user.id}`, "athena");
    for (const [key, value] of Object.entries(d["profileChanges"][0]["profile"]["items"])) {
        if (value.templateId === "Accolades:accoladeid_stw_mission_sk_victory") return writeFileSync("MSKCount.txt", `MSK Clears: ${value.attributes.earned_count}`);
    }
    // process.exit();
})();
