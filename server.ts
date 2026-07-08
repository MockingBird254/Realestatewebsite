/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_PROPERTIES, INITIAL_SETTINGS, INITIAL_BLOGS, INITIAL_TESTIMONIALS } from './src/data';
import { Property, PropertyRequest, BlogArticle, CompanySettings } from './src/types';

// Local Database Path
const DB_FILE = path.join(process.cwd(), 'db.json');

// In-memory databases initialized with our default Kenya data (mutated dynamically and saved)
let properties: Property[] = [...INITIAL_PROPERTIES];
let settings: CompanySettings = { ...INITIAL_SETTINGS };
let blogs: BlogArticle[] = [...INITIAL_BLOGS];
let requests: PropertyRequest[] = [];

// Helper to load and save local JSON database for persistent storage across runs
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data.properties && data.properties.length > 0) {
        properties = data.properties;
      } else {
        properties = [...INITIAL_PROPERTIES];
      }
      if (data.settings) {
        settings = { ...INITIAL_SETTINGS, ...data.settings };
      } else {
        settings = { ...INITIAL_SETTINGS };
      }
      if (data.blogs && data.blogs.length > 0) {
        blogs = data.blogs;
      } else {
        blogs = [...INITIAL_BLOGS];
      }
      if (data.requests) requests = data.requests;
      
      // If we newly seeded properties or blogs, save them to disk
      if (!data.properties || data.properties.length === 0 || !data.blogs || data.blogs.length === 0) {
        saveDatabase();
      }
      console.log('--- DB Loaded successfully from db.json ---');
    } else {
      properties = [...INITIAL_PROPERTIES];
      blogs = [...INITIAL_BLOGS];
      saveDatabase();
      console.log('--- Created initial db.json database ---');
    }
  } catch (error) {
    console.error('Error loading db.json file, running in memory:', error);
  }
}

function saveDatabase() {
  try {
    const data = {
      properties,
      settings,
      blogs,
      requests
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database to db.json:', error);
  }
}

// Helper to initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  // Load persistent local JSON database
  loadDatabase();

  // Explicitly ensure uploads directory exists on server startup
  const uploadDirOnStart = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDirOnStart)) {
    fs.mkdirSync(uploadDirOnStart, { recursive: true });
    console.log('--- Created uploads directory on startup ---');
  }

  const app = express();
  const PORT = 3000;

  // Configure Multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'file-' + uniqueSuffix + ext);
    }
  });
  const upload = multer({ storage });

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // API Routes
  // Upload API route supporting both multipart (multer) and JSON base64 body fallback
  app.post('/api/upload', (req, res, next) => {
    // If it's a JSON request with base64 data, process it directly
    if (req.body && req.body.base64) {
      try {
        const { base64, filename } = req.body;
        // Clean base64 string
        const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        
        const ext = path.extname(filename || 'image.png') || '.png';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const uniqueFilename = `file-${uniqueSuffix}${ext}`;
        const destPath = path.join(process.cwd(), 'uploads', uniqueFilename);
        
        fs.writeFileSync(destPath, buffer);
        const fileUrl = `/uploads/${uniqueFilename}`;
        return res.json({ success: true, url: fileUrl });
      } catch (err) {
        return res.status(500).json({ error: 'Base64 upload failed: ' + (err as Error).message });
      }
    }
    // Otherwise, delegate to multer multipart parser
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Multer upload failed: ' + err.message });
      }
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.json({ success: true, url: fileUrl });
      } catch (e) {
        return res.status(500).json({ error: (e as Error).message });
      }
    });
  });

  // 1. Properties
  app.get('/api/properties', (req, res) => {
    res.json(properties);
  });

  // Download local properties and database catalog in JSON/CSV format
  app.get('/api/properties/download', (req, res) => {
    try {
      const format = req.query.format || 'json';
      
      if (format === 'csv') {
        let csvContent = "\ufeff" + "ID,Title,Type,PropertyType,Price (KES),County,Town,Estate,Bedrooms,Bathrooms,Parking,Size,AI Verified,Date Listed\n";
        properties.forEach(p => {
          const cleanTitle = (p.title || '').replace(/"/g, '""');
          const cleanEstate = (p.estate || '').replace(/"/g, '""');
          csvContent += `"${p.id}","${cleanTitle}","${p.type}","${p.propertyType}",${p.price},"${p.county}","${p.town}","${cleanEstate}",${p.bedrooms},${p.bathrooms},${p.parking || 0},"${p.size}","${p.isAiVerified ? 'YES' : 'NO'}","${p.dateListed || ''}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=unique_merchants_properties_backup.csv');
        return res.send(csvContent);
      } else {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=unique_merchants_database_backup.json');
        
        // Bundle both properties, current requests, and settings for a comprehensive backup
        const backupData = {
          exportDate: new Date().toISOString(),
          totalProperties: properties.length,
          totalRequests: requests.length,
          settings,
          properties,
          requests
        };
        return res.send(JSON.stringify(backupData, null, 2));
      }
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  app.post('/api/properties', (req, res) => {
    try {
      const newProperty: Property = {
        ...req.body,
        id: `prop-${Date.now()}`,
        dateListed: new Date().toISOString()
      };
      properties.unshift(newProperty);
      saveDatabase();
      res.status(201).json({ success: true, property: newProperty });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // 2. Client Requests
  app.get('/api/properties/requests', (req, res) => {
    res.json(requests);
  });

  app.post('/api/properties/requests', (req, res) => {
    try {
      const newRequest: PropertyRequest = {
        ...req.body,
        id: `req-${Date.now()}`,
        status: 'pending',
        dateSubmitted: new Date().toISOString()
      };
      requests.unshift(newRequest);
      saveDatabase();
      res.status(201).json({ success: true, request: newRequest });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  app.post('/api/properties/requests/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = requests.find(r => r.id === id);
    if (request) {
      request.status = status;
      saveDatabase();
      res.json({ success: true, request });
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  });

  // 3. Company Settings
  app.get('/api/settings', (req, res) => {
    res.json(settings);
  });

  app.post('/api/settings', (req, res) => {
    try {
      settings = { ...settings, ...req.body };
      saveDatabase();
      res.json({ success: true, settings });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  app.put('/api/settings', (req, res) => {
    try {
      settings = { ...settings, ...req.body };
      saveDatabase();
      res.json({ success: true, settings });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // Wipes all properties, requests, blogs and resets company settings
  app.post('/api/db/clear', (req, res) => {
    try {
      properties = [];
      settings = { ...INITIAL_SETTINGS };
      blogs = [];
      requests = [];
      saveDatabase();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // 4. Blogs and Comments
  app.get('/api/blogs', (req, res) => {
    res.json(blogs);
  });

  app.post('/api/blogs', (req, res) => {
    try {
      const newBlog: BlogArticle = {
        ...req.body,
        id: `blog-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        comments: []
      };
      blogs.unshift(newBlog);
      saveDatabase();
      res.status(201).json({ success: true, blog: newBlog });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  app.post('/api/blogs/:id/comments', (req, res) => {
    const { id } = req.params;
    const { author, text } = req.body;
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      const comment = {
        id: `comm-${Date.now()}`,
        author: author || "Anonymous Buyer",
        text,
        date: new Date().toISOString().split('T')[0]
      };
      blog.comments.push(comment);
      saveDatabase();
      res.status(201).json({ success: true, comment });
    } else {
      res.status(404).json({ error: "Blog not found" });
    }
  });

  // 5. Testimonials
  app.get('/api/testimonials', (req, res) => {
    res.json(INITIAL_TESTIMONIALS);
  });

  // 6. AI Live Chat Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    const { messages } = req.body;
    const promptMessage = messages[messages.length - 1]?.text || "";

    const ai = getAi();
    if (!ai) {
      // High-quality fallback when API key is missing
      const responseText = simulateAiResponse(promptMessage);
      return res.json({ text: responseText, demo: true });
    }

    try {
      const propertyContext = properties.map(p => 
        `- ${p.title} in ${p.town}, ${p.county}. Type: ${p.type}. PropertyType: ${p.propertyType}. Price: KES ${p.price.toLocaleString()}. Beds: ${p.bedrooms}, Baths: ${p.bathrooms}, Size: ${p.size}. Agent: ${p.agent.name}.`
      ).join('\n');

      const companyContext = `
        Company Name: ${settings.name}
        HQ Location: ${settings.address}
        Office Hours: ${settings.officeHours}
        Mobile: ${settings.mobile}
        WhatsApp: ${settings.whatsapp}
        Email: ${settings.email}
        About: ${settings.about}
        Mission: ${settings.mission}
        Vision: ${settings.vision}
      `;

      const systemInstruction = `
        You are "Unique Merchants AI Property Assistant" based in Kenol, Murang'a County, Kenya.
        Your tone is professional, luxurious, welcoming, and highly knowledgeable.
        You assist clients with:
        1. Browsing our active property listings.
        2. Financial, mortgage, and rental advice.
        3. Explaining our services (Property management, tenant sourcing, lease management).
        4. Scheduling property viewings.

        Our Company Details:
        ${companyContext}

        Our Current Properties:
        ${propertyContext}

        Rule: Be helpful, structured, and give details in local KES pricing. Highlight why Kenol, Murang'a is a fast-growing area.
        If a user asks to view a property, politely request their name, telephone, and preferred date, and mention that our team will call them.
      `;

      const chatHistory = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Drop the last user message because we'll pass it as contents
      const formattedHistory = chatHistory.slice(0, -1);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMessage,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      res.json({ text: `Unique Merchants AI is currently operating in local intelligent backup mode. Here is standard guidance: ${simulateAiResponse(promptMessage)}`, error: (error as Error).message });
    }
  });

  // 7. AI Natural Language Search Endpoint
  app.post('/api/ai/search', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.json({ properties });

    const ai = getAi();
    if (!ai) {
      // Fallback regex parser for natural language searches
      const filters = fallbackParseSearch(query);
      const filtered = filterProperties(filters);
      return res.json({ properties: filtered, filters, demo: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Extract real estate search filters from this natural language query: "${query}". Return a JSON object with properties:
        - "type" (can be 'buy', 'rent', 'commercial', 'land', or null)
        - "town" (string or null)
        - "maxPrice" (number or null)
        - "bedrooms" (number or null)
        - "propertyType" (string, e.g. 'Maisonette', 'Apartment', 'Plot', or null)`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "buy, rent, commercial, or land" },
              town: { type: Type.STRING },
              maxPrice: { type: Type.INTEGER },
              bedrooms: { type: Type.INTEGER },
              propertyType: { type: Type.STRING }
            }
          }
        }
      });

      const filters = JSON.parse(response.text.trim());
      const filtered = filterProperties(filters);
      res.json({ properties: filtered, filters });
    } catch (e) {
      // Fallback to local filtering
      const filters = fallbackParseSearch(query);
      const filtered = filterProperties(filters);
      res.json({ properties: filtered, filters, error: (e as Error).message });
    }
  });

  // 8. Companion App AI Extraction API
  app.post('/api/companion/analyze', async (req, res) => {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: "No text description provided" });

    const ai = getAi();
    if (!ai) {
      // Highly functional simulation when API key is missing
      const simulatedResult = simulateCompanionExtraction(rawText);
      return res.json({ success: true, data: simulatedResult, demo: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this raw spoken/text description of a property and extract the structured real estate data.
        Description: "${rawText}"
        Return a JSON object with the following schema:
        - "title" (String, premium catchy title)
        - "description" (String, fully formatted, polished, and luxurious)
        - "price" (Number)
        - "type" (string: 'buy', 'rent', 'commercial', 'land')
        - "propertyType" (string: 'Maisonette', 'Apartment', 'Plot', 'Commercial Space')
        - "county" (string, e.g. Murang'a, Kiambu)
        - "town" (string, e.g. Kenol, Thika, Juja, Makuyu)
        - "estate" (string, default to 'Suburbs' or 'Center' if not specified)
        - "bedrooms" (Number, 0 for land)
        - "bathrooms" (Number, 0 for land)
        - "parking" (Number)
        - "size" (String, e.g. '50x100 ft', '0.25 Acres')
        - "amenities" (Array of strings, e.g. ["Borehole Water", "Solar Systems", "Benced Plot"])`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.INTEGER },
              type: { type: Type.STRING },
              propertyType: { type: Type.STRING },
              county: { type: Type.STRING },
              town: { type: Type.STRING },
              estate: { type: Type.STRING },
              bedrooms: { type: Type.INTEGER },
              bathrooms: { type: Type.INTEGER },
              parking: { type: Type.INTEGER },
              size: { type: Type.STRING },
              amenities: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "price", "type", "propertyType", "county", "town", "bedrooms", "size"]
          }
        }
      });

      const extractedData = JSON.parse(response.text.trim());
      res.json({ success: true, data: extractedData });
    } catch (e) {
      const simulatedResult = simulateCompanionExtraction(rawText);
      res.json({ success: true, data: simulatedResult, error: (e as Error).message });
    }
  });

  // Vite development / production middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Unique Merchants server started on http://localhost:${PORT}`);
  });
}

// Helper: Filter properties locally based on filters
function filterProperties(filters: any) {
  return properties.filter(p => {
    if (filters.type && p.type !== filters.type) return false;
    if (filters.town && !p.town.toLowerCase().includes(filters.town.toLowerCase())) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.bedrooms && p.bedrooms < filters.bedrooms) return false;
    if (filters.propertyType && !p.propertyType.toLowerCase().includes(filters.propertyType.toLowerCase())) return false;
    return true;
  });
}

// Helper: Regex Search Parser for Natural Language query fallback
function fallbackParseSearch(query: string) {
  const q = query.toLowerCase();
  const filters: any = {
    type: null,
    town: null,
    maxPrice: null,
    bedrooms: null,
    propertyType: null
  };

  // 1. Detect Buy / Rent / Land / Commercial
  if (q.includes("rent") || q.includes("let") || q.includes("monthly")) {
    filters.type = "rent";
  } else if (q.includes("land") || q.includes("plot") || q.includes("shamba") || q.includes("acre")) {
    filters.type = "land";
  } else if (q.includes("commercial") || q.includes("shop") || q.includes("warehouse") || q.includes("office")) {
    filters.type = "commercial";
  } else if (q.includes("buy") || q.includes("sale") || q.includes("purchase") || q.includes("million")) {
    filters.type = "buy";
  }

  // 2. Towns
  if (q.includes("kenol")) filters.town = "Kenol";
  else if (q.includes("murang'a") || q.includes("muranga")) filters.town = "Murang'a Town";
  else if (q.includes("thika")) filters.town = "Thika";
  else if (q.includes("juja")) filters.town = "Juja";
  else if (q.includes("makuyu")) filters.town = "Makuyu";

  // 3. Price (under / below / KES X)
  const priceMatches = q.match(/(?:under|below|less than|kes|sh|shs)\s*([\d,]+)\s*(?:million|m|k|thousand)?/i) || q.match(/([\d,]+)\s*(?:million|m|k|thousand)/i);
  if (priceMatches) {
    let priceStr = priceMatches[1].replace(/,/g, "");
    let priceNum = parseInt(priceStr);
    
    // Check if million
    if (q.includes("million") || q.includes(" m ")) {
      priceNum = priceNum * 1000000;
    } else if (q.includes("thousand") || q.includes(" k ")) {
      priceNum = priceNum * 1000;
    } else if (priceNum < 1000 && (q.includes("m") || q.includes("million"))) {
      priceNum = priceNum * 1000000;
    }
    filters.maxPrice = priceNum;
  }

  // 4. Bedrooms
  const bedMatches = q.match(/(\d+)\s*bed/i);
  if (bedMatches) {
    filters.bedrooms = parseInt(bedMatches[1]);
  }

  // 5. Property types
  if (q.includes("maisonette") || q.includes("meisonet")) filters.propertyType = "Maisonette";
  else if (q.includes("apartment") || q.includes("flat") || q.includes("bedsitter")) filters.propertyType = "Apartment";
  else if (q.includes("plot") || q.includes("land")) filters.propertyType = "Plot";
  else if (q.includes("shop") || q.includes("retail")) filters.propertyType = "Commercial Space";

  return filters;
}

// Helper: Smart fallback response simulations for the Live Chat
function simulateAiResponse(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return `Hello! Welcome to **Unique Merchants**. I am your premium real-estate digital guide. Are you looking to buy, rent, or find land here in Murang'a County or other parts of Kenya? I can also help you calculate mortgage payments and schedule site viewings!`;
  }
  if (q.includes("kenol") || q.includes("murang'a") || q.includes("muranga")) {
    return `Murang'a County—especially **Kenol Town**—is experiencing rapid real-estate appreciation due to the newly expanded dual carriageway. We currently have beautiful listings:
1. **Elegant 4-Bedroom Golden Ridge Maisonette** in Kenol (KES 18,500,000) - AI Verified.
2. **Prime 1/4 Acre Development Plot** near Kenol Center (KES 3,200,000) - perfect for building flats or a family mansion.
3. **1-Acre Commercial Land** in Makuyu (KES 9,500,000) on the highway.
Would you like to schedule a free site tour?`;
  }
  if (q.includes("mortgage") || q.includes("calculate") || q.includes("interest") || q.includes("afford")) {
    return `We offer a built-in mortgage & acquisition calculator on our platform! 
Generally, in Kenya, commercial mortgages have interest rates of 13% to 16% with loan periods of up to 15 years.
When buying land or a house, remember to factor in:
- **Stamp Duty**: 4% for urban areas, 2% for agricultural land.
- **Legal Fees**: ~1-2% of purchase price.
- **Transfer Fees & Valuation**.
Would you like me to do a quick math calculation for you? Tell me your budget and deposit amount!`;
  }
  if (q.includes("rent") || q.includes("bedsitter") || q.includes("apartment") || q.includes("2 bedroom")) {
    return `For rental properties, we currently have:
- **Modern 2-Bedroom Apartment** near Murang'a University (KES 28,000 / month). Excellent water supply, borehole access, and top security.
Let me know if you would like us to arrange a showing with our lead rental agent, Mercy Wanjiku!`;
  }
  if (q.includes("land") || q.includes("plot") || q.includes("shamba")) {
    return `Land buying is our core specialty. All our land pieces are fully vetted with ready title deeds. We currently have:
- **Prime 1/4 Acre** in Kenol (KES 3.2M) - flat, red soil, fully serviced.
- **1-Acre Highway Commercial Land** in Makuyu (KES 9.5M).
We manage all surveyor searches and Land Control Board clearances. What size and budget are you targeting?`;
  }
  if (q.includes("manage") || q.includes("property management") || q.includes("rent collection")) {
    return `Unique Merchants provides full-scale **Property Management Services** across Kenya:
- **Tenant Sourcing & Vetting** (Capping defaults)
- **Hassle-free Rent Collection** with direct owner payouts
- **Full-time Maintenance & Inspections**
- **Financial transparency reports** visible through our Owner Portal.
Would you like to talk to our lead portfolio manager to list your rental blocks with us?`;
  }
  if (q.includes("view") || q.includes("schedule") || q.includes("visit") || q.includes("book")) {
    return `I would be delighted to schedule a viewing for you! Please tell me:
1. Which property/land you want to visit.
2. Your preferred date and time.
3. Your mobile number.
Once you provide these details, our representative ${settings.leadBrokerName || 'Daniel Maina'} will contact you immediately to finalize the transport arrangements. We organize physical viewing tours every Wednesday and Saturday!`;
  }

  return `Thank you for contacting **Unique Merchants**. We are Kenya's trusted partner for modern real estate solutions. 
We have beautiful options in Kenol, Murang'a, Juja, Thika, and Makuyu. 
You can search properties naturally by asking me something like: "Do you have plots in Kenol?" or use our interactive search filters on the Properties page! How can I assist you further?`;
}

// Helper: Simulate companion app voice/text extraction
function simulateCompanionExtraction(text: string) {
  const clean = text.toLowerCase();
  let price = 1200000;
  let type: 'buy' | 'rent' | 'commercial' | 'land' = 'buy';
  let propType = 'Plot';
  let town = 'Kenol';
  let county = "Murang'a";
  let bedrooms = 0;
  let size = '50x100 ft';

  // Extract price
  const priceRegex = /([\d.]+)\s*(million|m|thousand|k|shs|kes)/i;
  const match = clean.match(priceRegex);
  if (match) {
    let num = parseFloat(match[1]);
    if (match[2].includes('m') || match[2].includes('million')) {
      price = num * 1000000;
    } else if (match[2].includes('k') || match[2].includes('thousand')) {
      price = num * 1000;
    } else {
      price = num;
    }
  }

  // Detect types
  if (clean.includes('rent') || clean.includes('let')) {
    type = 'rent';
    propType = 'Apartment';
    bedrooms = 2;
    size = '90 sq m';
  } else if (clean.includes('commercial') || clean.includes('shop') || clean.includes('office')) {
    type = 'commercial';
    propType = 'Commercial Space';
    size = '100 sq m';
  } else if (clean.includes('land') || clean.includes('plot') || clean.includes('shamba')) {
    type = 'land';
    propType = 'Plot';
  } else if (clean.includes('maisonette') || clean.includes('house') || clean.includes('home')) {
    type = 'buy';
    propType = 'Maisonette';
    bedrooms = 3;
    size = '220 sq m';
  }

  // Towns
  if (clean.includes('thika')) {
    town = 'Thika';
    county = 'Kiambu';
  } else if (clean.includes('juja')) {
    town = 'Juja';
    county = 'Kiambu';
  } else if (clean.includes('makuyu')) {
    town = 'Makuyu';
    county = "Murang'a";
  } else if (clean.includes('muranga') || clean.includes("murang'a")) {
    town = "Murang'a Town";
    county = "Murang'a";
  }

  // Bedrooms
  const bedMatch = clean.match(/(\d+)\s*bedroom/);
  if (bedMatch) {
    bedrooms = parseInt(bedMatch[1]);
  }

  // Title generation
  const title = `Vetted ${size} ${propType} in ${town}, ${county}`;
  
  // Luxury description generation
  const description = `This is a premium property strategically located in the fast-growing area of ${town}, ${county}. It offers excellent accessibility, reliable infrastructure (borehole water, electricity connection points), and is highly optimized for immediate development or rental returns. Verified and authenticated by the Unique Merchants expert vetting team with an active AI-verification badge. Perfect investment opportunity.`;

  return {
    title,
    description,
    price,
    type,
    propertyType: propType,
    county,
    town,
    estate: "Suburbs",
    bedrooms,
    bathrooms: bedrooms > 0 ? bedrooms : 0,
    parking: bedrooms > 0 ? 2 : 0,
    size,
    amenities: ["Water Connection", "Electricity Nearby", "Ready Title Deed", "Secure Access Road"]
  };
}

startServer();
