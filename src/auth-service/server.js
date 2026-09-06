import express from 'express';

import authRouter from './routes/auth.js';
import { config } from '../common/config.js';
import { db } from './db.js';
import { renderPage } from '../common/html.js';

const app = express();

app.use(express.json());
app.set('trust proxy', true);

app.get('/health', async (_req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  } catch (error) {
    next(error);
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(authRouter);

app.use((error, req, res, _next) => {
  console.error(error);

  if (req.accepts('html')) {
    return res.status(500).type('html').send(renderPage({
      title: 'Server Error',
      eyebrow: 'Toggle Account',
      heading: 'Something went wrong',
      description: 'The auth service hit an unexpected problem while handling this request.',
      body: '<div class="panel error">Please try again in a moment.</div>'
    }));
  }

  return res.status(500).json({ error: 'Internal server error.' });
});

app.listen(config.authServicePort, () => {
  console.log(`Auth service listening on port ${config.authServicePort}`);
});
