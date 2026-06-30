import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDb, writeDb, DatabaseSchema } from './db';
import { SERVICES_DATA, CLIENTS_DATA, TESTIMONIALS_DATA, FEATURED_PROJECTS } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();

// Configure static upload path: public/uploads
const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve uploads folder statically in development proxy as well
router.use('/uploads', express.static(UPLOAD_DIR));

// Custom dependency-free multipart parser to replace multer (which avoids npm install issues)
const parseMultipart = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return next();
  }

  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!match) {
    return res.status(400).json({ error: 'No multipart boundary found in headers.' });
  }

  const boundaryStr = '--' + (match[1] || match[2]);
  const boundary = Buffer.from(boundaryStr);
  const chunks: Buffer[] = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    try {
      const buffer = Buffer.concat(chunks);
      const positions: number[] = [];
      let index = 0;

      while (true) {
        const pos = buffer.indexOf(boundary, index);
        if (pos === -1) break;
        positions.push(pos);
        index = pos + boundary.length;
      }

      if (positions.length < 2) {
        return res.status(400).json({ error: 'Invalid multipart body data structure.' });
      }

      for (let i = 0; i < positions.length - 1; i++) {
        const start = positions[i] + boundary.length;
        const end = positions[i + 1];
        const part = buffer.subarray(start, end);

        // Header ends with \r\n\r\n
        const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
        if (headerEnd === -1) continue;

        const headersText = part.subarray(0, headerEnd).toString('utf-8');
        // File data lies between headers and the closing \r\n before next boundary
        const data = part.subarray(headerEnd + 4, part.length - 2);

        const dispositionMatch = headersText.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
        if (dispositionMatch) {
          const name = dispositionMatch[1];
          const filename = dispositionMatch[2];

          if (name === 'file' && filename) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(filename);
            const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, '_');
            const finalFilename = `${base}-${uniqueSuffix}${ext}`;
            const filepath = path.join(UPLOAD_DIR, finalFilename);

            fs.writeFileSync(filepath, data);

            (req as any).file = {
              filename: finalFilename,
              path: filepath,
              originalname: filename
            };
            break;
          }
        }
      }
      next();
    } catch (err: any) {
      res.status(500).json({ error: 'Failed parsing multipart request: ' + err.message });
    }
  });
};

// JSON parsing middleware for non-multipart requests
router.use((req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'];
  if (contentType && contentType.includes('application/json')) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// GET all database content
router.get('/api/data', (req: Request, res: Response) => {
  try {
    const db = readDb();
    res.json(db);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read database: ' + err.message });
  }
});

// POST to update services
router.post('/api/services', (req: Request, res: Response) => {
  try {
    const db = readDb();
    db.services = req.body;
    writeDb(db);
    res.json({ success: true, services: db.services });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save services: ' + err.message });
  }
});

// POST to update clients
router.post('/api/clients', (req: Request, res: Response) => {
  try {
    const db = readDb();
    db.clients = req.body;
    writeDb(db);
    res.json({ success: true, clients: db.clients });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save clients: ' + err.message });
  }
});

// POST to update projects
router.post('/api/projects', (req: Request, res: Response) => {
  try {
    const db = readDb();
    db.projects = req.body;
    writeDb(db);
    res.json({ success: true, projects: db.projects });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save projects: ' + err.message });
  }
});

// POST to submit inquiry
router.post('/api/inquiries', (req: Request, res: Response) => {
  try {
    const db = readDb();
    const newInquiry = req.body;
    db.inquiries = [newInquiry, ...(db.inquiries || [])];
    writeDb(db);
    res.json({ success: true, inquiries: db.inquiries });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit inquiry: ' + err.message });
  }
});

// DELETE inquiry
router.delete('/api/inquiries/:id', (req: Request, res: Response) => {
  try {
    const db = readDb();
    const { id } = req.params;
    db.inquiries = db.inquiries.filter(i => i.id !== id);
    writeDb(db);
    res.json({ success: true, inquiries: db.inquiries });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete inquiry: ' + err.message });
  }
});

// POST upload file using custom parser
router.post('/api/upload', parseMultipart, (req: Request, res: Response) => {
  try {
    const reqFile = (req as any).file;
    if (!reqFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${reqFile.filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (err: any) {
    res.status(500).json({ error: 'Upload process failed: ' + err.message });
  }
});

// POST reset database
router.post('/api/reset', (req: Request, res: Response) => {
  try {
    const defaultDb: DatabaseSchema = {
      services: SERVICES_DATA.map(s => ({
        ...s,
        subsections: s.subsections.map(sub => ({
          ...sub,
          subCategory: sub.title.toLowerCase().includes('model') ? 'Clothing Shoot' : 
                       sub.title.toLowerCase().includes('fluid') ? 'Footwear Shoot' : 'General'
        }))
      })),
      clients: CLIENTS_DATA,
      testimonials: TESTIMONIALS_DATA,
      projects: FEATURED_PROJECTS,
      inquiries: [
        {
          id: "demo-inq",
          name: "Elena Rostova",
          email: "elena@auracosmetics.co",
          serviceId: "ai-photo-shoot",
          scope: "Premium Campaign",
          message: "Looking for an immediate AI photo shoot for our luxury skincare serum line. We need high fidelity liquid splash render assets. Your 2-day delivery SLA is exactly what we need.",
          budget: "$5,000 - $10,000",
          timestamp: new Date().toLocaleString(),
          status: "unread"
        }
      ]
    };
    writeDb(defaultDb);
    res.json({ success: true, data: defaultDb });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset database: ' + err.message });
  }
});

app.use(router);
export default app;
