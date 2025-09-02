import 'dotenv/config';
import { app, log } from './app.js';

const port = process.env.PORT || 4000;
app.listen(port, () => log.info(`API listening on :${port}`));
