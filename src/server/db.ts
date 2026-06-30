import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVICES_DATA, CLIENTS_DATA, TESTIMONIALS_DATA, FEATURED_PROJECTS } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define db file path in the workspace root
const DB_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'db.json');

export interface DatabaseSchema {
  services: typeof SERVICES_DATA;
  clients: typeof CLIENTS_DATA;
  testimonials: typeof TESTIMONIALS_DATA;
  projects: typeof FEATURED_PROJECTS;
  inquiries: any[];
}

export function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
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
          timestamp: "6/18/2026, 11:30:15 AM",
          status: "unread"
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
    console.log('Database initialized successfully at:', DB_PATH);
  }
}

export function readDb(): DatabaseSchema {
  initDb();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  const parsedData = JSON.parse(data);
  
  // Backwards compatibility for unique IDs
  let modified = false;
  if (parsedData.services) {
    parsedData.services = parsedData.services.map((s: any) => {
      if (s.subsections) {
        s.subsections = s.subsections.map((sub: any) => {
          if (!sub.id) {
            modified = true;
            return { ...sub, id: "work-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5) };
          }
          return sub;
        });
      }
      return s;
    });
  }
  
  if (modified) {
    writeDb(parsedData);
  }
  
  return parsedData;
}

export function writeDb(data: DatabaseSchema) {
  initDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
