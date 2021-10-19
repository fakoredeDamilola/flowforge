// Injects some test data into the database


async function inject(app) {
    try {
        const userAlice = await app.db.models.User.create({admin: true, username: "alice", name: "Alice Skywalker", email: "alice@example.com", password: 'aaPassword'});
        const userBob = await app.db.models.User.create({username: "bob", name: "Bob Solo", email: "bob@example.com", password: 'bbPassword'});
        const userChris = await app.db.models.User.create({username: "chris", name: "Chris Kenobi", email: "chris@example.com", password: 'ccPassword'});

        const team1 = await app.db.models.Team.create({name: "ATeam"});
        const team2 = await app.db.models.Team.create({name: "BTeam"});
        const team3 = await app.db.models.Team.create({name: "CTeam"});

        await team1.addUser(userAlice, { through: { role:"owner" } });
        await team1.addUser(userBob, { through: { role:"member" } });
        await team1.addUser(userChris, { through: { role:"member" } });

        await team2.addUser(userBob, { through: { role:"owner" } });
        await team2.addUser(userAlice, { through: { role:"member" } });

        await team3.addUser(userAlice, { through: { role:"owner" } });
        await team3.addUser(userChris, { through: { role:"member" } });

        const project1 = await app.db.models.Project.create({name: "project1", type: "basic", url: "http://instance1.example.com"});
        await team1.addProject(project1);

        const project2 = await app.db.models.Project.create({name: "project2", type: "basic", url: "http://instance2.example.com"});
        // Can also do
        // await project1.setTeam(team1);
        await team2.addProject(project2);

        const p2AuthClient = await app.db.controllers.AuthClient.createClientForProject(project2);
        //  For testing, print out the ID/Secret here to copy into the node-red project instance config
        // console.log(p2AuthClient);
/*
{
  clientID: 'ffp_ya2uR3AZD-hmGITngOAuDceIdsAPjpG3ESp-tOY2xOc',
  clientSecret: 'cPphxptcX49iYnBIavEHY8CLjDFymJ-TPNy2s1XMMEVNHKGzeKRiqVeGWDbwLCN8',
  ownerType: 'project',
  ownerId: '4f0100a0-4abf-4b3c-adf0-688282bd4b24'
}
*/


    } catch(err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            // looks like the test data is already there
        } else {
            throw err
        }
    }
    // let teamA = await app.db.models.Team.byName("ATeam")
    // let names = [
    //     "brainy-wallcreeper-2819",
    //     "cloudy-lark-sparrow-9355",
    //     "enchanting-magnolia-warbler-8489",
    //     "doubtful-reed-warbler-2460",
    //     "proud-ruddy-shelduck-3990",
    //     "splendid-rook-9331",
    //     "cloudy-woodpigeon-1761",
    //     "joyous-spotted-flycatcher-5829",
    //     "precious-canada-goose-2743",
    //     "bewildered-caspian-tern-3464",
    //     "healthy-peregrine-3779"
    // ]
    // for (var i=0;i<names.length;i++) {
    //     const p = await app.db.models.Project.create({name: names[i], type: "basic", url: "http://instance1.example.com"});
    //     await teamA.addProject(p);
    // }
}

module.exports = {
    inject
}
