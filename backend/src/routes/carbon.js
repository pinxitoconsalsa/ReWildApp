const router = require('express').Router();
const prisma = require('../lib/prisma');

// Emission factors (tonnes CO2/year)
// transport: 0 = no car/flight, 1 = frequent flyer  -> 0 to 4.5 t
// diet:      0 = vegan, 1 = high meat               -> 0.5 to 3.3 t
// hogar:     0 = efficient, 1 = high consumption    -> 0.5 to 2.5 t
function calcTonnes(transport, diet, hogar) {
  const t = 4.5 * transport;
  const d = 0.5 + 2.8 * diet;
  const h = 0.5 + 2.0 * hogar;
  return parseFloat((t + d + h).toFixed(2));
}

// Trees needed: 1 tree absorbs ~0.2 t/year
function treesNeeded(tonnes) {
  return Math.ceil(tonnes / 0.2);
}

// POST /api/carbon/calculate  { transport: 0-1, diet: 0-1, hogar: 0-1 }
router.post('/calculate', async (req, res) => {
  let { transport = 0.5, diet = 0.5, hogar = 0.3 } = req.body;

  // Clamp all values strictly to [0, 1]
  transport = Math.min(1, Math.max(0, parseFloat(transport) || 0));
  diet      = Math.min(1, Math.max(0, parseFloat(diet)      || 0));
  hogar     = Math.min(1, Math.max(0, parseFloat(hogar)     || 0));

  const totalTonnes = calcTonnes(transport, diet, hogar);
  const trees = treesNeeded(totalTonnes);

  const tip = `Al reducir un 10% tu transporte, podrías salvar ${Math.ceil(trees * 0.1)} árboles este año.`;

  // Log anónimamente — no aceptar userId del cliente para evitar spoofing
  try {
    await prisma.carbonCalcLog.create({
      data: { userId: null, transport, diet, hogar, totalTonnes, treesNeeded: trees },
    });
  } catch (_) {
    // El log no es crítico; ignorar fallos silenciosamente
  }

  res.json({ totalTonnes, treesNeeded: trees, tip });
});

module.exports = router;
