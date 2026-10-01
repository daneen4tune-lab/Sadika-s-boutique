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
app.post('/api/chat-concierge', async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the AI Concierge and Couture Stylist for "Sadika's Bridal Boutique" in Cape Town, owned and personally run by master dressmaker Sadika Karbary.
Your purpose is to warmly assist customers who aren't sure which service they need, give style & fabric advice, and explain studio booking rules.

The Boutique's 5 Core Services:
1. Bridal Wear: Custom wedding dresses (corsetry, illusion lace, mikado silk), cathedral veils, bridesmaids dresses, mother of the bride/groom, flower girls. Lead time: 3 to 6 months.
2. Matric Dance Couture: Show-stopping matric ball & prom gowns (structured boning, cowl drapes, high leg splits, puddle trains). Lead time: 2 to 3 months (minimum 8 weeks).
3. Festive & Traditional Occasion Wear: Modest silk kurti sets, abayas, Eid outfits, Christmas celebration attire, traditional cultural wear. Lead time: 6 to 8 weeks.
4. Evening & Gala Wear: Black-tie floor length gowns, cocktail dresses, velvet/silk evening wear. Lead time: 6 to 8 weeks.
5. Fine Alterations & Repairs: Expert resizing, hem adjustments, taking in/letting out, neckline redesign, zipper repairs. Lead time: 1 to 2 weeks.

Critical Studio Rules from Sadika Karbary:
- Recommended booking lead time: Ideally 2 to 3 months in advance, especially during December peak rush and Matric season (Sept-Nov).
- Operating Hours: Strictly Monday to Friday (09:00 to 17:00). Strictly closed on Saturdays and Sundays. Emphasize that although the atelier is home-based in Rondebosch/Claremont, walk-ins and after-hours/weekend visits are never accommodated.
- Booking Confirmation: A booking is officially confirmed on Sadika's cutting calendar ONLY once the client's fabric is physically received at the atelier.
- Respond in the language requested (language code: ${language}). Keep answers concise (2-4 sentences or short bullet points), warm, boutique-chic, and encouraging.
- At the end of your response, when relevant, clearly recommend which of the 5 services they should book.`;

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const historyText = conversationHistory
          .slice(-6)
          .map((m: any) => `${m.role === 'user' ? 'Client' : 'Concierge'}: ${m.text}`)
          .join('\n');

        const prompt = `${historyText ? historyText + '\n' : ''}Client: ${message}\nConcierge:`;

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
        console.warn('Gemini chat error, falling back to smart concierge:', geminiError?.message);
      }
    }

    // Heuristic Fallback
    const lower = message.toLowerCase();
    let reply = `Welcome to Sadika's Bridal Boutique! Sadika Karbary specialises in bespoke bridal gowns, matric dance couture, occasion wear (such as Eid and festive outfits), evening wear, and fine alterations. Could you share what event or function date you are planning for? Remember, we recommend booking 2–3 months ahead!`;
    let recommendedService = 'Bespoke Consultation';

    if (lower.includes('wedding') || lower.includes('bride') || lower.includes('veil')) {
      reply = `Congratulations on your upcoming wedding! Sadika Karbary creates custom bridal gowns, cathedral veils, bridesmaids dresses, and mother-of-the-bride ensembles. For bridal wear, our recommended lead time is 3 to 6 months. Would you like to check available weekday consultation slots?`;
      recommendedService = 'Bridal Wear';
    } else if (lower.includes('matric') || lower.includes('prom') || lower.includes('ball')) {
      reply = `How exciting! For matric balls, Sadika creates structured corseted gowns, cowl draping, and glamorous red-carpet silhouettes. Matric season fills up quickly, so we require fabric at least 8 weeks prior (2–3 months lead time recommended). Would you like to submit an enquiry?`;
      recommendedService = 'Matric Dance';
    } else if (lower.includes('eid') || lower.includes('christmas') || lower.includes('traditional') || lower.includes('kurti')) {
      reply = `For festive celebrations, Eid, and cultural occasions, Sadika creates exquisite modest silk kurti sets, abayas, and coordinated family occasion wear (typically 6–8 weeks lead time). Please drop off fabric early to guarantee your slot!`;
      recommendedService = 'Occasion Wear';
    } else if (lower.includes('alter') || lower.includes('hem') || lower.includes('zip') || lower.includes('shorten') || lower.includes('take in')) {
      reply = `Sadika provides master alterations, resizing, and hem leveling (typically 1–2 weeks turnaround). Please remember to bring the exact shoes and undergarments you plan to wear to your fitting!`;
      recommendedService = 'Alterations & Repairs';
    } else if (lower.includes('hour') || lower.includes('open') || lower.includes('weekend') || lower.includes('time')) {
      reply = `Sadika's Bridal Boutique operates strictly Monday to Friday, 09:00 to 17:00, and is closed on Saturdays and Sundays. All fittings are strictly by appointment at our private home atelier in Rondebosch/Claremont.`;
    }

    return res.json({
      reply,
      recommendedService,
      source: 'heuristic',
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
