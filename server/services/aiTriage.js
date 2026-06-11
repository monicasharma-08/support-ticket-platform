// server/services/aiTriage.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (err) {
  console.warn('⚠️  Gemini API initialization failed:', err.message);
}

/**
 * Triage a support ticket using Gemini API
 * Returns: { category, priority, suggestedResponse }
 */
async function triageTicket(title, description) {
  try {
    if (!genAI) {
      console.log('⚠️  Gemini API not available, using fallback.');
      return keywordFallback(title, description);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a support ticket triage assistant for a software company.
Analyze the following support ticket and respond ONLY with a valid JSON object.
Do not include markdown, backticks, or any explanation outside the JSON.

Ticket Title: ${title}
Ticket Description: ${description}

Respond with exactly this structure (no extra text):
{
  "category": "one of: Billing | Technical Issue | Account Access | Feature Request | General Inquiry",
  "priority": "one of: Low | Medium | High | Critical",
  "suggestedResponse": "a professional 2-3 sentence draft reply the agent can send to the customer"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse JSON from response
    const parsed = JSON.parse(responseText);

    // Validate structure
    if (!parsed.category || !parsed.priority || !parsed.suggestedResponse) {
      throw new Error('Invalid response structure from AI');
    }

    console.log(`✅ AI Triage: ${parsed.category} | ${parsed.priority}`);

    return {
      category: parsed.category,
      priority: parsed.priority,
      suggestedResponse: parsed.suggestedResponse,
    };
  } catch (error) {
    console.warn('⚠️  AI Triage error:', error.message);
    return keywordFallback(title, description);
  }
}

/**
 * Fallback triage using keyword matching
 * This ensures tickets always get categorized even if AI is unavailable
 */
function keywordFallback(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  // Determine category
  let category = 'General Inquiry';
  if (/billing|invoice|payment|charge|refund|price/.test(text)) {
    category = 'Billing';
  } else if (/login|password|access|account|locked|locked out/.test(text)) {
    category = 'Account Access';
  } else if (/bug|error|crash|broken|not working|fail|issue|problem/.test(text)) {
    category = 'Technical Issue';
  } else if (/feature|request|suggest|improve|add|enhancement/.test(text)) {
    category = 'Feature Request';
  }

  // Determine priority
  let priority = 'Medium';
  if (/urgent|critical|down|outage|cannot|unable|data loss|emergency/.test(text)) {
    priority = 'Critical';
  } else if (/broken|failed|error|payment|payment failed|not working/.test(text)) {
    priority = 'High';
  } else if (/slow|intermittent|sometimes|occasionally/.test(text)) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  // Generate suggested response
  let suggestedResponse = 'Thank you for reaching out to our support team. We have received your ticket and a support agent will respond to you shortly.';

  if (category === 'Billing') {
    suggestedResponse =
      'Thank you for contacting us regarding billing. We take all payment concerns seriously and will investigate this immediately. A support specialist will follow up with you within 24 hours.';
  } else if (category === 'Account Access') {
    suggestedResponse =
      'We understand account access issues can be frustrating. Our support team will help you regain access to your account as quickly as possible. Please stand by for further assistance.';
  } else if (category === 'Technical Issue') {
    suggestedResponse =
      'We\'re sorry you\'re experiencing a technical issue. Our engineering team will investigate this right away to get you back up and running.';
  } else if (category === 'Feature Request') {
    suggestedResponse =
      'Thank you for the feature suggestion. We appreciate your feedback and will review your request with our product team.';
  }

  console.log(`✅ Fallback Triage: ${category} | ${priority}`);

  return {
    category,
    priority,
    suggestedResponse,
  };
}

module.exports = {
  triageTicket,
  keywordFallback,
};