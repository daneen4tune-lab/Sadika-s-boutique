/**
 * Knowledge Base for Iris - Atelier AI Stylist & Concierge
 * Sadika's Bridal Boutique (Sadika Karbary)
 */

export interface KnowledgeTopic {
  id: string;
  category: 'services' | 'policies' | 'fabrics' | 'fittings' | 'faq';
  title: string;
  keywords: string[];
  content: string;
}

export const IRIS_KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'kb-boutique-identity',
    category: 'policies',
    title: "About Sadika's Bridal Boutique & Sadika Karbary",
    keywords: ['owner', 'sadika', 'karbary', 'about', 'location', 'where', 'address', 'who'],
    content: `Sadika's Bridal Boutique is an artisanal haute dressmaking and bespoke couture atelier founded and personally run by master dressmaker Sadika Karbary. 
Located in a tranquil residential garden studio in Rondebosch / Claremont, Cape Town (14 Jasmine Close). 
With over 25 years of couture experience, Sadika specializes in individually drafted, cut, and hand-finished bridal gowns, matric ball couture, festive occasion wear, and fine alterations. 98% of Sadika's clientele are recurring families who value her uncompromising precision and warmth.`,
  },
  {
    id: 'kb-operating-hours',
    category: 'policies',
    title: 'Operating Hours & Strict Weekend Closure',
    keywords: ['hours', 'operating', 'open', 'weekend', 'saturday', 'sunday', 'time', 'trading', 'walk-in'],
    content: `Trading Hours: Monday to Friday from 09:00 to 17:00.
Weekend Policy: Strictly CLOSED on Saturdays and Sundays. 
Because Sadika's atelier is situated in a private garden residence, working from home does NOT mean 24/7 availability or walk-in visits. All consultations and fittings are strictly conducted by pre-scheduled appointment during official weekday business hours.`,
  },
  {
    id: 'kb-fabric-rule',
    category: 'policies',
    title: 'Fabric Handover Booking Confirmation Rule',
    keywords: ['fabric', 'booking', 'confirm', 'confirmation', 'deposit', 'policy', 'slot', 'secure'],
    content: `CRITICAL ATELIER RULE: An enquiry or booking request is only officially confirmed and reserved on Sadika Karbary's atelier cutting calendar once the customer's fabric has been physically handed over to the atelier. 
Because Sadika is an artisanal solo couture creator with limited weekly cutting slots, fabric delivery serves as the tangible project commitment and booking deposit. Without physical fabric receipt, dates remain tentative and open to other bookings.`,
  },
  {
    id: 'kb-lead-times',
    category: 'policies',
    title: 'Lead Times & Busy Season Notice',
    keywords: ['lead time', 'how long', 'months', 'advance', 'december', 'matric', 'season', 'urgent', 'rush'],
    content: `Standard Lead Time: Ideally 2 to 3 months (8 to 12 weeks) in advance for bespoke garments.
Peak Busy Season: October, November, and December (encompassing Matric Ball season, festive Eid/Christmas, and summer weddings). For these months, bookings must be initiated 3 to 4 months in advance.
Under 6 weeks is considered Urgent and requires capacity review; under 3 weeks is Critical and typically not feasible unless for simple alterations.
Alterations & Repairs: Typically require 1 to 2 weeks turnaround.`,
  },
  {
    id: 'kb-service-bridal',
    category: 'services',
    title: 'Bespoke Bridal Wear & Veils',
    keywords: ['wedding', 'bridal', 'bride', 'veil', 'gown', 'bridesmaid', 'mother of the bride', 'flower girl', 'train'],
    content: `Bespoke Bridal Wear is Sadika Karbary's premier specialty:
- Custom Wedding Gowns: Hand-draped to individual body measurements. Silhouette choices include Classic A-Line, Dramatic Ballgown, Mermaid/Trumpet, Sleek Bias Sheath, and Modern Column. Built with internal structured corsetry, French boning, and hand-appliqued lace.
- Custom Veils: Handcrafted in English tulle, trimmed with French lace or pearl beading. Length options: Cathedral (300cm), Chapel (250cm), Fingertip (100cm), or vintage Birdcage blusher.
- Bridal Party: Bridesmaids, Maid of Honour, Mother of the Bride/Groom bespoke couture, and flower girl dresses.
- Fabrics: Silk Mikado, Duchess Satin, French Chantilly / Alençon Lace, Italian Silk Crepe, Soft Bridal Tulle.
- Fabric meterage estimate: 5m to 8m main fabric + 4m lining (more for cathedral trains).
- Lead Time: 3 to 6 months recommended.
- Starting Investment: From R6,500.`,
  },
  {
    id: 'kb-service-matric',
    category: 'services',
    title: 'Matric Dance Couture Gowns',
    keywords: ['matric', 'dance', 'ball', 'prom', 'corset', 'slit', 'train', 'teen', 'school'],
    content: `Matric Dance Couture:
- Show-stopping red-carpet silhouettes tailored for school leavers.
- Popular styling: Internal boned corsetry, deep cowl necklines, thigh-high leg splits, low-back draping, and glamorous puddle trains.
- Recommended Fabrics: Heavy stretch satin, liquid silk crepe, shimmer metallic lurex, Duchess satin, structured scuba-crepe.
- Fabric meterage estimate: 4m to 6m main fabric + 3m lining.
- Lead Time: 2 to 3 months (minimum 8 weeks).
- Starting Investment: From R3,800.`,
  },
  {
    id: 'kb-service-occasion',
    category: 'services',
    title: 'Festive & Traditional Occasion Wear (Eid, Christmas, Cultural)',
    keywords: ['eid', 'traditional', 'kurti', 'palazzo', 'abaya', 'christmas', 'festive', 'modest', 'cultural'],
    content: `Festive & Traditional Occasion Wear:
- Elegantly tailored modest ensembles for religious milestones and celebrations.
- Specialities: Flared pure silk kurtis, tailored palazzo pant suits, embroidered raw silk abayas with pearl beadwork, and festive family matching outfits.
- Recommended Fabrics: Raw silk, silk dupion, georgette, embroidered chiffon, brocade jacquards.
- Lead Time: 6 to 8 weeks.
- Starting Investment: From R2,400.`,
  },
  {
    id: 'kb-service-evening',
    category: 'services',
    title: 'Haute Evening & Gala Wear',
    keywords: ['evening', 'gala', 'black tie', 'cocktail', 'dinner', 'velvet', 'event'],
    content: `Haute Evening & Gala Wear:
- Sophisticated evening gowns for black-tie banquets, charity galas, and milestone birthdays.
- Styles: Sculpted velvet column gowns, bias-cut silk slip dresses, one-shoulder draped gowns.
- Fabrics: Stretch velvet, heavy crepe de chine, satin-back crepe, sequin overlays.
- Lead Time: 6 to 8 weeks.
- Starting Investment: From R3,200.`,
  },
  {
    id: 'kb-service-alterations',
    category: 'services',
    title: 'Fine Alterations & Master Repairs',
    keywords: ['alterations', 'repair', 'shorten', 'hem', 'take in', 'let out', 'zip', 'resize', 'mending'],
    content: `Fine Alterations & Repairs:
- Expert adjustments for luxury evening wear, designer dresses, bridal sample gowns, and heirloom garments.
- Services: Hem shortening (including delicate horsehair braid and baby hems), taking in/letting out side seams, resetting zippers, strap adjustments, neckline remodeling.
- Fitting Mandate: Customers MUST bring the exact shoes (heel height) and undergarments/shapewear intended for the event to their fitting.
- Turnaround: 1 to 2 weeks.
- Starting Investment: From R250.`,
  },
  {
    id: 'kb-fittings-etiquette',
    category: 'fittings',
    title: 'Fitting Workflow & Atelier Etiquette',
    keywords: ['fitting', 'toile', 'baste', 'etiquette', 'guest', 'shoes', 'appointment', 'late'],
    content: `Fitting Workflow:
1. Initial Consultation: 45 minutes to review silhouette sketches, assess body measurements, and inspect fabric.
2. Toile / First Fitting: Mock-up fitting constructed in calico or raw fabric structure to perfect ease and neckline before cutting precious fabric.
3. Second Fitting: Garment cut in final luxury fabric; zipper, lining, and hem leveled.
4. Final Fitting & Handover: Steamed finish, final try-on with heels, and garment bag collection upon full invoice settlement.
Etiquette Rules:
- Punctuality: Slots are strictly 45 minutes. A 15-minute grace period applies; arrivals later than 15 minutes must reschedule.
- Guest Limit: Maximum 1 accompanying friend or family member to ensure an intimate, focused fitting atmosphere.
- Undergarments: Always wear neutral, seamless underwear and bring your planned heels.`,
  },
  {
    id: 'kb-pricing-invoicing',
    category: 'policies',
    title: 'Invoicing, Deposits & Banking Details',
    keywords: ['payment', 'price', 'deposit', 'bank', 'eft', 'fnb', 'account', 'invoice'],
    content: `Financial Terms & Invoicing:
- Deposit: 50% deposit is required upon booking confirmation (accompanied by fabric handover).
- Final Payment: Remaining 50% balance is payable at final fitting prior to garment handover.
- Payment Methods: Electronic Funds Transfer (EFT).
- Banking: First National Bank (FNB), Account Holder: Sadika's Bridal Boutique, Account Number: 62849103822, Branch Code: 250655.
- Reference Format: Invoice Number / Client Surname.`,
  },
];

/**
 * Searches the Iris Knowledge Base for relevant context snippets matching user query.
 */
export function queryIrisKnowledge(query: string, maxResults = 3): KnowledgeTopic[] {
  const cleanQ = query.toLowerCase();
  const scored = IRIS_KNOWLEDGE_BASE.map((topic) => {
    let score = 0;
    topic.keywords.forEach((kw) => {
      if (cleanQ.includes(kw.toLowerCase())) score += 3;
    });
    if (topic.title.toLowerCase().includes(cleanQ)) score += 5;
    if (topic.content.toLowerCase().includes(cleanQ)) score += 1;
    return { topic, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.topic);
}

/**
 * Returns formatted context string for LLM system prompt.
 */
export function getKnowledgeBasePromptContext(): string {
  return IRIS_KNOWLEDGE_BASE.map(
    (t) => `### ${t.title} [Category: ${t.category}]\n${t.content}`
  ).join('\n\n');
}
