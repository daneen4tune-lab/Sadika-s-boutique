import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI client (User-Agent header required)
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint for AI Enquiry Analysis
app.post('/api/analyze-enquiry', async (req, res) => {
  try {
    const {
      customerName,
      service,
      occasion,
      eventDate,
      garmentDescription,
      designPreferences,
      notes,
      preferredFittingDate,
      databaseContext, // Structured database inputs (active orders, capacity, customer history)
    } = req.body;

    const dbContextText = databaseContext
      ? `
Live Atelier Database Context:
- Active Orders in Production: ${databaseContext.activeOrdersInProduction || 3} garments currently being cut/sewn.
- Client History: ${databaseContext.isRecurring ? `Valued returning client (${databaseContext.previousOrdersCount || 1} prior completed garments, measurements already on file).` : 'New prospective client.'}
- Conflicting Atelier Deliveries in Target Month: ${databaseContext.deliveriesInTargetMonth || 2} orders scheduled.
- Atelier Capacity Status: ${databaseContext.capacityStatus || 'Moderate load'}`
      : '';

    const promptText = `Analyze this bespoke dressmaking enquiry for Sadika's Bridal Boutique with structured database context:
Customer Name: ${customerName || 'Prospective Client'}
Service Requested: ${service || 'Bespoke Garment'}
Occasion: ${occasion || 'Special Occasion'}
Event/Function Date: ${eventDate || 'Not specified'}
Garment Description: ${garmentDescription || 'Not specified'}
Design Preferences: ${designPreferences || 'None specified'}
Customer Notes: ${notes || 'None'}
Requested Consultation/Fitting Date: ${preferredFittingDate || 'Flexible'}
${dbContextText}

Sadika's Bridal Boutique Rules & Invariants:
- Standard booking lead time: ideally 2 to 3 months (8 to 12 weeks) in advance.
- Busy period (e.g. Matric ball season in Sept/Oct, Wedding and holiday rush in November/December): requires 3+ months.
- Under 6 weeks is considered URGENT (tight turnaround, requires expedited production or review).
- Under 3 weeks is CRITICAL (high risk of conflict or rush fee needed).
- Weekend appointments are strictly not allowed (studio operates Monday-Friday only).
- Bookings are only officially confirmed once fabric is physically received from the customer.

Dynamically tailor your schedule feasibility, urgency level, and administrative recommendations based on the structured database context (e.g. if the customer already has measurements on file, note that drafting is accelerated; if atelier volume is high in target month, highlight capacity constraints).`;

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction:
              "You are the intelligent studio assistant for Sadika's Bridal Boutique, a bespoke bridal and couture dressmaking atelier owned by Sadika Karbary. Extract accurate details, assess schedule feasibility, and generate administrative suggestions. Output strict JSON matching the schema.",
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                requestedService: { type: Type.STRING },
                occasion: { type: Type.STRING },
                eventDate: { type: Type.STRING },
                garmentType: { type: Type.STRING },
                designPreferences: { type: Type.STRING },
                importantNotes: { type: Type.STRING },
                urgencyLevel: {
                  type: Type.STRING,
                  description: 'Must be "Standard", "Urgent", or "Critical"',
                },
                urgencyReason: { type: Type.STRING },
                leadTimeWeeks: { type: Type.NUMBER },
                suggestedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                fabricRequirements: { type: Type.STRING },
                estimatedFittingSchedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stage: { type: Type.STRING },
                      suggestedTiming: { type: Type.STRING },
                      notes: { type: Type.STRING },
                    },
                  },
                },
                studioPolicyAlerts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'requestedService',
                'occasion',
                'garmentType',
                'urgencyLevel',
                'urgencyReason',
                'suggestedActions',
              ],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, analysis: parsed, source: 'gemini' });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to smart analysis:', geminiError?.message);
      }
    }

    // Smart Fallback Rule Engine when API key is unavailable or during rate limits
    const now = new Date();
    let leadTimeWeeks = 10;
    let urgencyLevel = 'Standard';
    let urgencyReason = "Booking timeframe aligns with Sadika's Bridal Boutique standard 2–3 months lead time.";

    if (eventDate) {
      const target = new Date(eventDate);
      const diffMs = target.getTime() - now.getTime();
      const diffWeeks = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 7)));
      leadTimeWeeks = diffWeeks;

      const isDecember = target.getMonth() === 11;

      if (diffWeeks <= 3) {
        urgencyLevel = 'Critical';
        urgencyReason = `Event is in only ${diffWeeks} weeks! Critical lead-time shortage. Immediate fabric drop-off and express production schedule required.`;
      } else if (diffWeeks <= 6) {
        urgencyLevel = 'Urgent';
        urgencyReason = `Event is in ${diffWeeks} weeks (under standard 8-12 weeks recommendation). Studio attention required to confirm slot feasibility.`;
      } else if (isDecember && diffWeeks < 12) {
        urgencyLevel = 'Urgent';
        urgencyReason = `Event is in December peak season (${diffWeeks} weeks away). High studio volume requires early fabric handover.`;
      }
    }

    const fallbackAnalysis = {
      requestedService: service || 'Bespoke Evening Wear',
      occasion: occasion || 'Special Event',
      eventDate: eventDate || 'Date to be confirmed',
      garmentType: garmentDescription ? garmentDescription.split('.')[0] : 'Custom Tailored Garment',
      designPreferences: designPreferences || 'Tailored fit with bespoke detailing',
      importantNotes: notes || 'Awaiting initial measurement and fabric consultation',
      urgencyLevel,
      urgencyReason,
      leadTimeWeeks,
      suggestedActions: [
        'Confirm initial weekday consultation slot (Mon–Fri)',
        'Remind customer that booking is confirmed only when fabric is physically received',
        urgencyLevel !== 'Standard'
          ? 'Review current atelier production board before confirming tight turnaround'
          : 'Issue preliminary quote or invoice upon consultation',
      ],
      fabricRequirements: 'Customer to supply primary fabric and matching lining at consultation.',
      estimatedFittingSchedule: [
        {
          stage: 'Initial Consultation & Measurements',
          suggestedTiming: 'Within 5–7 days (Weekday only)',
          notes: 'Review design sketch, take body measurements, record fabric specifications.',
        },
        {
          stage: 'Toile / First Fitting',
          suggestedTiming: `${Math.max(2, Math.floor(leadTimeWeeks * 0.4))} weeks before event`,
          notes: 'Mock-up fitting in calico or raw fabric structure.',
        },
        {
          stage: 'Second Fitting',
          suggestedTiming: `${Math.max(1, Math.floor(leadTimeWeeks * 0.2))} weeks before event`,
          notes: 'Main fabric construction, zipper insertion, and hem leveling.',
        },
        {
          stage: 'Final Fitting & Handover',
          suggestedTiming: '5 to 7 days before event date',
          notes: 'Steam finish, final try-on, and garment bag handover upon full invoice settlement.',
        },
      ],
      studioPolicyAlerts: [
        "Sadika's Bridal Boutique strictly observes weekday operating hours (Closed Saturdays and Sundays).",
        'Physical fabric receipt serves as the booking deposit/confirmation.',
      ],
    };

    return res.json({ success: true, analysis: fallbackAnalysis, source: 'heuristic' });
  } catch (err: any) {
    console.error('Analysis error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Endpoint for AI-powered Chatbot Concierge
// Endpoint for AI-powered Chatbot Concierge ("Iris") grounded in Knowledge Base
app.post('/api/chat-concierge', async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en', knowledgeContext = '' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are "Iris", the bespoke Atelier AI Stylist and Couture Concierge for "Sadika's Bridal Boutique" in Cape Town, founded and personally run by master dressmaker Sadika Karbary.
Your name is Iris. Introduce yourself as Iris when appropriate.
You must be strictly grounded in the following official Atelier Knowledge Base:

=== ATELIER KNOWLEDGE BASE ===
1. Boutique Identity & Master Dressmaker:
   - Name: Sadika's Bridal Boutique.
   - Master Dressmaker & Owner: Sadika Karbary (over 25 years of bespoke dressmaking and haute couture experience).
   - Location: 14 Jasmine Close, Rondebosch / Claremont, Cape Town. Private residential garden atelier.
   - 98% of clients are loyal, recurring generational families.

2. Five Core Atelier Services & Starting Investments:
   - 1. Bridal Wear: Custom bridal gowns, veil lengths (Cathedral 300cm, Chapel 250cm, Fingertip 100cm, Birdcage), bridesmaids, mother of the bride/groom, flower girls. Silhouettes: A-Line, Dramatic Ballgown, Mermaid, Column Sheath. Fabrics: Silk Mikado, Duchess Satin, French Chantilly/Alençon Lace, Italian Silk Crepe, English Tulle. Lead time: 3 to 6 months. Starting from R6,500.
   - 2. Matric Dance Couture: Red-carpet corseted gowns, structured boning, deep cowl necklines, high leg splits, dramatic backless silhouettes, puddle trains. Fabrics: Heavy stretch satin, shimmer metallic lurex, Duchess satin. Lead time: 2 to 3 months (minimum 8 weeks). Starting from R3,800.
   - 3. Festive & Traditional Occasion Wear: Modest Eid ensembles, flared pure silk kurtis, palazzo suits, embroidered raw silk abayas with pearl beadwork, Christmas celebration attire, cultural garments. Lead time: 6 to 8 weeks. Starting from R2,400.
   - 4. Haute Evening & Gala Wear: Black-tie floor length gowns, cocktail dresses, velvet/silk evening wear. Lead time: 6 to 8 weeks. Starting from R3,200.
   - 5. Fine Alterations & Repairs: Expert resizing, hem adjustments (baby hems, horsehair braids), taking in/letting out, neckline redesign, zipper repairs. Lead time: 1 to 2 weeks. Starting from R250.

3. Inflexible Atelier Rules & Invariants:
   - Operating Hours: Strictly Monday to Friday (09:00 to 17:00). Strictly CLOSED on Saturdays and Sundays. Emphasize that because the atelier is located at a private residence, walk-in visits and weekend/evening visits are strictly prohibited. All visits are strictly by scheduled weekday appointment.
   - Booking Confirmation Rule: A booking is ONLY officially confirmed and locked on Sadika's cutting calendar once the client's fabric has been physically received at the atelier. Fabric receipt acts as the project commitment.
   - Lead Times: Standard 2–3 months ahead (8–12 weeks). For peak season (October-December for Matric Ball season, festive Eid/Christmas, and summer weddings), clients must book 3–4 months ahead.
   - Fitting Etiquette: Punctuality is required (slots are 45 minutes; 15-minute grace period applies, beyond which appointments must be rescheduled). Maximum 1 accompanying guest. Clients must bring their intended heel height shoes and seamless undergarments.
   - Financial Terms: 50% deposit required upon booking/fabric receipt; remaining 50% due at final fitting prior to collection. EFT banking details: FNB, Branch 250655.
${knowledgeContext ? `\n=== ADDITIONAL RETRIEVED GROUNDING ===\n${knowledgeContext}\n` : ''}

Behavior Instructions:
- Always speak with an elegant, warm, boutique-chic aesthetic, embodying Iris the Atelier Stylist.
- Respond in the language requested (language code: ${language}). Keep answers concise (2-4 clear sentences or short bullet points), helpful, and grounded in the rules above.
- Never invent business hours or policies that contradict the knowledge base.
- Conclude your reply with a clear recommendation on which of the 5 services they should book.`;

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const historyText = conversationHistory
          .slice(-6)
          .map((m: any) => `${m.role === 'user' ? 'Client' : 'Iris'}: ${m.text}`)
          .join('\n');

        const prompt = `${historyText ? historyText + '\n' : ''}Client: ${message}\nIris:`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        if (response.text) {
          return res.json({
            reply: response.text.trim(),
            source: 'gemini',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini Iris chat error, falling back to grounded concierge:', geminiError?.message);
      }
    }

    // Grounded Fallback Engine for Iris
    const lower = message.toLowerCase();
    let reply = `Hello! I'm Iris, your Atelier AI Stylist at Sadika's Bridal Boutique. Sadika Karbary specialises in bespoke bridal gowns, matric dance couture, festive & Eid occasion wear, evening wear, and fine alterations in Rondebosch, Cape Town. Could you tell me about your event date and what silhouette you have in mind? Please note we recommend booking 2–3 months ahead!`;
    let recommendedService = 'Bespoke Consultation';

    if (lower.includes('wedding') || lower.includes('bride') || lower.includes('veil')) {
      reply = `Hello! I'm Iris. For your wedding, Sadika Karbary designs bespoke bridal gowns (A-line, mermaid, ballgown, or sleek sheath) with custom internal corsetry and handcrafted veils (cathedral, chapel, or fingertip). Bridal wear starts from R6,500 and requires 3 to 6 months lead time. Would you like to book a weekday consultation?`;
      recommendedService = 'Bridal Wear';
    } else if (lower.includes('matric') || lower.includes('prom') || lower.includes('ball')) {
      reply = `Hello! I'm Iris. For matric balls, Sadika crafts red-carpet corseted gowns with boning, cowl drapes, high leg splits, and puddle trains. Starting from R3,800 with an 8 to 12 week lead time (2–3 months). Since matric season fills fast, would you like to check weekday availability?`;
      recommendedService = 'Matric Dance';
    } else if (lower.includes('eid') || lower.includes('christmas') || lower.includes('traditional') || lower.includes('kurti')) {
      reply = `Hello! I'm Iris. For Eid, festive celebrations, and cultural events, Sadika designs modest pure silk flared kurtis, palazzo suits, and embroidered raw silk abayas with pearl detailing (starting from R2,400, 6–8 weeks lead time). Please drop off fabric early to guarantee your slot!`;
      recommendedService = 'Occasion Wear';
    } else if (lower.includes('alter') || lower.includes('hem') || lower.includes('zip') || lower.includes('shorten') || lower.includes('take in')) {
      reply = `Hello! I'm Iris. Sadika provides master alterations, precision hem leveling, and garment resizing (1–2 weeks turnaround, from R250). Please remember you must bring the exact shoes and undergarments you plan to wear to your fitting!`;
      recommendedService = 'Alterations & Repairs';
    } else if (lower.includes('hour') || lower.includes('open') || lower.includes('weekend') || lower.includes('time')) {
      reply = `Hello! I'm Iris. Sadika's Bridal Boutique operates strictly Monday to Friday, 09:00 to 17:00, and is strictly closed on Saturdays and Sundays. All fittings are strictly by appointment at our private home atelier in Rondebosch/Claremont.`;
    }

    return res.json({
      reply,
      recommendedService,
      source: 'grounded-knowledge',
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ error: 'Failed to process chat concierge message' });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Sadika's Bridal Boutique server running on http://localhost:${PORT}`);
  });
}

startServer();
