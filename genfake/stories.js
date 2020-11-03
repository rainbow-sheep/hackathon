const pictures = [
  "https://github.com/ezhang7423/hackathonUser/raw/master/%40earthvessle%20Views%20so%20drop%20dead%20gorgeous%20they%E2%80%99d%20make%20you%20look%20twice..jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/A%20few%20pics%20from%20the%20Sunday%20market.%20%23srilanka%20%23travelphotography%20%23travel%23visitsrilanka%20%23farmersmarket%23mountlavinia%23.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/A%20sweet%20little%20home%20in%20Ukraine%20%F0%9F%8F%A0%20Photo%20by%20%40ladanivskyy.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Be%20like%20a%20tree%F0%9F%8C%B3%F0%9F%98%87Storms%20make%20trees%20take%20deeper%20roots%F0%9F%98%89%F0%9F%98%8E%F0%9F%94%A5%F0%9F%94%A5.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Had%20an%20amazing%20day%20driving%20around%20Atacama!%20The%20wild%20Flamingos%20at%20Laguna%20Chaxa%20were%20definitely%20a%20highlight.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Hvar%20Croatia%F0%9F%8F%96%20%F0%9F%8C%8A%20%F0%9F%9A%A3%E2%98%80.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/It's%20been%202months%20since%20the%20day%20I%20skip%20editing%20and%20uploading%20my%20featured%20photos%20on%20my%20account%2C%20but%20today..%20I%20hope%20I%20could%20start%20doing%20things%20again%20back%20when%20it%20was%20before.%20Hello%202020!.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/I%E2%80%99m%20in%20love%20with%20%F0%9F%92%9A%F0%9F%A4%8D%E2%9D%A4%EF%B8%8F%20%23venice%20%23italy%20%23travel%20%23travelphotography%20%23grandpalace%20%23island%20%23instalove%20%23photoshooting%20%23photooftheday%20%23TagsForLikes%20%23love%20%23loveit%20%23like4like%20%23blogger.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Lisboa%2C%20Pavilh%C3%A3o%20Carlos%20Lopes..jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Paradise%E2%9D%A4%EF%B8%8F%F0%9F%87%B9%F0%9F%87%AD%20%23thailand%20%23travelphotography%20%23travelgirl.jpg",
  "https://raw.githubusercontent.com/ezhang7423/hackathonUser/master/Pics%20from%20Skerch%20last%20night%2C%20including%20the%20famous%20loos.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Regardless%20the%20destination%2C%20all%20roads%20lead%20home.%20%F0%9F%9A%98%20%F0%9F%8C%8C.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Serene%20pink%20and%20blue%20skies%20above%20Boracay%E2%80%99s%20white%20beach.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/So%20I%20have%20been%20hearing%20about%20this%20bitcoin%20investment%20stuff.%20I%20finally%20gave%20it%20a%20try%2C%20and%20now%20I'm%20one%20of%20the%20benefactors%20thanks%20to%20%40invest_with_meghan.%20I'm%20%2411%2C000%20richer.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/The%20Sunshine%20Coast%20sure%20does%20look%20good%20from%20the%20top%20of%20%23MtNinderry%20%F0%9F%8C%84.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/The%20most%20beautiful%20Castle%20ever%20%F0%9F%8F%B0%20thanks%20to%20%40benbuffone.jpg",
  "https://github.com/ezhang7423/hackathonUser/raw/master/Today%2C%20I%20went%20to%20Tachiki-Kannon%20Temple%20with%20my%20son%2C%20he%20was%20training%20to%20drive%20because%20he%20is%20beginner%20driver%20got%20driving%20license%20last%20month!.jpg",
  "https://raw.githubusercontent.com/ezhang7423/hackathonUser/master/such%20a%20fun%20shoot%20with%20these%20high%20school%20sweethearts.jpg",
];
require("dotenv").config();
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });

const axios = require("axios");
// const API_URL = 'http://34.69.9.37:9000/';
const API_URL = "http://localhost:9000/";

const fakerator = require("fakerator")();
var Sentencer = require("sentencer");

async function main() {
  let uid = (await axios.get(API_URL + "randomuid")).data;
  const uids = (
    await axios.get(API_URL + `recommendations?uid=${uid}`)
  ).data.map((d) => d.uid);
  console.log("GENERATING FAKE STORIES FOR", uids.length, "USERS");
  for (let uid of uids) {
    console.log(uid);

    await axios.post(API_URL + "story?uid=" + uid, {
      story: {
        title: Sentencer.make("{{ an_adjective }} {{ noun }}"),
        description: Sentencer.make(
          "My {{ adjective }} destination where I saw so many {{ adjective }} {{ nouns }}!"
        ),
        pic_url: pictures[Math.floor(Math.random() * pictures.length)],
      },
    });
  }
}

main();
