import cors from 'cors';

type OriginCallback = (err: Error | null, allow?: boolean) => void;

const whitelist = new Set(
  [
    process.env.ORIGIN,
    process.env.VITE_ORIGIN,
    'http://localhost:5173',
  ].filter(Boolean) as string[]
);

const corsMiddleware = cors({
  origin(origin: string | undefined, cb: OriginCallback) {
    if (!origin) return cb(null, true); // allow curl/health etc
    const allowed = [...whitelist].some((host) => {
      if (!host) return false;
      return origin === host || origin.endsWith(host.replace(/^https?:\/\//, ''));
    });
    cb(null, allowed);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: false,
  maxAge: 86400,
});

export default corsMiddleware;
