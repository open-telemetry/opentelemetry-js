import express from 'express';
import winston from 'winston';
import { rollTheDice } from './dice.js';

const PORT: number = parseInt(process.env.APPLICATION_PORT || '8080', 10);
const app = express();

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

app.get('/rolldice', (req, res) => {
  const rollsParam = req.query.rolls;
  const rolls = rollsParam === undefined ? 1 : Number(rollsParam);
  const player = req.query.player ? String(req.query.player) : 'anonymous player';

  if (Number.isNaN(rolls)) {
    res.status(400).json({
      status: 'error',
      message: 'Parameter rolls must be a positive integer',
    });
    logger.warn('GET /rolldice 400 Parameter rolls must be a positive integer');
    return;
  }

  try {
    const result = rollTheDice(rolls);

    res.status(200).json(result);
    logger.info('GET /rolldice 200');
    logger.debug(`${player} rolled ${JSON.stringify(result)}`);
  } catch (err) {
    res.status(500).end();
    logger.error(`GET /rolldice 500 ${(err as Error).message}`);
  }
});

export const server = app.listen(PORT, () => {
  logger.info(`Listening for requests on http://localhost:${PORT}`);
});
