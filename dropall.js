const API_URL = "http://localhost:9000/";
const axios = require("axios");

(async () => {
  await axios.get(API_URL + "clear");
})();
