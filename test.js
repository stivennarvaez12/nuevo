const bcrypt = require('bcryptjs');

async function crear() {
  const hash = await bcrypt.hash('123456', 10);
  console.log(hash);
}

crear();