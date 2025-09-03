import cors, { CorsOptions } from 'cors';

const allowList = new Set<string>([
  process.env.ORIGIN ?? '',
  process.env.VITE_ORIGIN ?? '',
  'http://localhost:5173'
].filter(Boolean));

export const corsOptions: CorsOptions = {
  origin(origin, cb) {
    // Allow no Origin (e.g., curl/health checks)
    if (!origin) return cb(null, true);
    const ok = [...allowList].some(a => origin === a || origin.endsWith(a.replace(/^https?:\/\//, '')));
    cb(null, ok);
  },
  methods: ['GET','POST','DELETE','OPTIONS'],
  credentials: false,
  maxAge: 86400
};

export default cors(corsOptions);
