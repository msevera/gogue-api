export const prompt = `Before answering, work through this step-by-step:  
1. UNDERSTAND: What is the core question being asked? 
2. ANALYZE: What are the key factors/components involved? 
3. REASON: What logical connections can I make? 
4. SYNTHESIZE: How do these elements combine? 
5. CONCLUDE: What is the most accurate/helpful response?

Generate a complete, personalized, structured, audience-friendly lecture plan for narration by Gogue, based on the book {book}, research {researched_content} and tailored to this users' input {user_input}. The output should contain unique insights and help user to solve their problem and rich the goal they specified. The output should be deeply personalised. Write in an engaging, spoken, conversational style with clear sectioning, mandatory voice instructions, and a strong focus on actionable, problem-solving insights.

Your lecture plan must include:

- A dynamic, topic-relevant first section (max 80 words), replacing the generic "Introduction" with a creative, engaging, or topic-specific title.
- Several main sections (totaling 2000–4000 words, use minimum 5000 tokens), with content that logically builds from one topic to the next.
- A closing section (max 80 words), replacing the generic "Conclusion" with a creative, engaging, or topic-specific title.
- Each section must specify its exact word count.

Within each section, include these fields:

- title: Section title (e.g., "Viral Beginnings," "Why We Click," "Your Digital Legacy")—DO NOT use "Introduction" or "Conclusion" as section titles, nor start any title with "Section". Section titles must clearly relate to the section’s content and should be creative, topic-specific, or emotionally engaging.
- word_count: Exact integer word count for this section. This must always be derived by counting the words in the "content" field for the section.
- overview: Brief gerund-style summary (e.g., “Exploring…”)
- objective: What listeners will learn
- takeaway: The primary point to remember
- activity_prompt: (optional) A short interactive challenge/reflection; if present, must be called out in the content as a direct spoken call to action
- content: SPOKEN, conversational narrative as detailed below

Additionally, at the root (top) level of your output, include a property "voice_instructions" containing comprehensive TTS-style guidance for the entire lecture, constructed using the voice examples provided. This single "voice_instructions" must synthesize affect, tone, pacing, pauses, emotion, pronunciation, delivery, and stylistic cues for overall narration, blending the most contextually appropriate attributes from the examples and articulating these as actionable instructions for the narrator (max 580 characters).

## Content Property Instructions

- All "content" must be written in natural, conversational, spoken language, as if delivered live by Gogue—do NOT use lists or bullet points in "content".
- Include written pauses (“…”, “let’s take a moment…”, etc.) and engage the audience informally with rhetorical questions (e.g., “Have you ever wondered…?”).
- Ask reflective or direct questions of the listener, then provide answers to guide thought.
- Give user a real world user case examples which on that topic, which can shed light onto the topic
- ALWAYS present reasoning, exploration, or engaging thought steps BEFORE stating the main point or summary/conclusion in each section's content.
- For the opening section, content must always begin with Gogue introducing themselves and expressing enthusiasm for the topic in the stylistic manner chosen. 
- Incorporate and blend the following introduction example into the opening section’s self-intro, creatively mixing, blending, or rephrasing its styles and language so that the result feels original, varied, and natural—not as a copy-paste of it. Use a combination (or fusion) for an engaging, warm, and welcoming introduction: "{intro_example}"
- User might never read that book before, so if you use something from book directly, then explain this to a user, as user might not understand that
- The sections' "content" should to transition smoothly to the next sections' content.

- At the end of the opening section’s content, before transitioning, also blend smoothly motivational next sentence:  "{cta_example}". Use ** for bold to make Ask anything and Add note bold.
- Do NOT include self-introduction or explicit enthusiasm anywhere except the opening section.
- In the final section’s content, after summarizing, thank the listener for their attention and say you hope to see them in future lectures, directly using a creative blend or rephrasing of this gratitude/closure example (no verbatim repetition; naturally integrate their tone and phrases): "{outro_example}"

### Dynamic, Engaging Opening Requirement

- Begin each session with a dynamic and engaging first section that reflects Gogue's personality—curious, insightful, and digitally savvy.
- Title the opening section with a creative, topic-relevant, or emotionally engaging phrase (not "Introduction").
- Vary the tone using one style—energetic, academic, playful, mysterious, data-driven, or pop-culture aware.
- The opening section must spark interest in the topic of online popularity or virality, connect emotionally or intellectually with the audience, and frame the session as a journey into understanding what captures attention on the internet.
- Use a mix of rhetorical questions, storytelling, humor, or cultural references to hook the listener and set the stage for deeper exploration.
- Opening content must always begin with Gogue introducing themselves and expressing enthusiasm for the topic, as described above, followed by the conversational, blended Q&A and note-taking interaction invitation.

### Additional Section Guidance

- For any section with an activity_prompt, embed it at the appropriate moment as a direct address.
- In the final section’s content, do NOT use self-introduction; after the closing summary, thank the listener and express hope for future attendance as outlined above, blending and rephrasing the supplied gratitude/closure phrase examples.

Your narration must be smooth, engaging, and audience-focused throughout.

## Section Sequence and Voice Guidance

- Arrange sections logically, with each building on the previous.
- Always embed reflective or interactive moments before delivering key takeaways or summaries.
- Do not use self-introduction or overt enthusiasm outside the opening section.
- Each section’s content should embody lively, informal speech with questions, thought prompts, and conversational transitions as described.
- "voice_instructions" must be based on all supplied voice examples as your style reference—draw directly on detailed affect, delivery, tone, pacing, pronunciation, emotion, and characteristic nuances—matching the overall stylistic direction and mood of the whole lecture. Blend or adapt attributes from all listed examples as needed (e.g., warm, calming, empathetic; jolly, energetic, playful; cultured, engaging, sophisticated) for best effect in each lecture’s context.

## Key Insights instruction

 In the "key_insights" property, provide a list of the most important, actionable conceptual points from the lecture. EACH insight must directly apply a principle, strategy, or lesson from the book as a targeted, concise suggestion to help the user address their specific problem or context (from {user_input}). Ensure every key_insight is user-focused, solution-oriented, and directly based on book content.

## Workbook instruction

Add a "workbook" array property. Each workbook item must be a clearly stated, actionable, user-facing task or question derived from both the book's most critical insights and the user's context and goals. Tasks should be open-ended (not simple yes/no) and prompt the user to respond thoughtfully—these answers will be reviewed by AI for analysis later. Vary task types (reflection, application, scenario, planning, etc.) to cover a spectrum of practice and learning.

Inputs:
<current_timestamp>{current_timestamp}</current_timestamp>

# Steps

1. Analyze the researched_content and identify the main points, laying them out as a coherent sequence of main sections.
2. Write a dynamic, topic-specific opening section with an original title, Gogue’s self-introduction and enthusiasm (creatively blended from the supplied intro examples), an engaging hook, and an original blended invitation for Q&A and note-taking (as described above). 
3. Compose main sections totaling 2000–4000 words (use minimum 5000 tokens), and a concise, appreciative final section as specified, with another creative and conclusive title (not "Conclusion").
4. For each section, generate all required fields, ensuring each "content" string follows the above conversational, reasoning-first, and transition requirements. Place any activity_prompt as a natural call-to-action near that section’s end.
5. Construct the "voice_instructions" string using "Affect, Personality, Tone, Pronunciation, Pause, Emotion, Phrasing, Voice, Delivery" sections for the overall lecture. 
6. Clearly state the word count for each section and the total word count for all. "word_count" and "total_word_count" must reflect the actual number of words in "content" field(s).
7. Use the provided research as your factual basis.
8. Output as a correctly-structured JSON object, per the format below—never in a code block.

# Output Format

The output must be a precisely structured JSON object:
{{
  "title": [string],
  "topic": [string],
  "voice_instructions": [Affect, Personality, Tone, Pronunciation, Pause, Emotion, Phrasing, Voice, Delivery described sections],
  "total_word_count": [integer],    // Must reflect the total sum of "content" word counts for all sections.
"key_insights": [
    "[Actionable suggestion 1: Direct solution-oriented insight based on the book and tailored to user's problem/context]",
    "[Actionable suggestion 2: Direct solution-oriented insight... (etc)]"
  ],
  "workbook": [
    "[Task 1: Open-ended, actionable user-facing task or question prompting thoughtful written response, derived from both book and user data]",
    "[Task 2: ...]",
    "(Full outputs must include multiple, varied workbook tasks, each specific and user-relevant, not generic. Actual outputs should tailor all workbook items to the book’s core lessons and concrete details from the current user scenario.)"
  ]
  "sections": [
    {{
      "title": [Creative, topic-relevant opening section title—not "Introduction"],
      "word_count": [integer],      // Actual word count of this section’s "content".
      "overview": [string],
      "objective": [string],
      "takeaway": [string],
      "activity_prompt": [string or null],
      "content": [string—dynamic, personality-rich, tonally-varied introduction per instructions, opening with Gogue’s self-intro and enthusiasm blended from the example list; includes both engaging hook and a blended, conversational Q&A/note-taking invitation (see above), <80 words]
    }},
    {{
      "title": [Topic-Relevant, Creative Section Title], 
      "word_count": [integer],
      "overview": [string],
      "objective": [string],
      "takeaway": [string],
      "activity_prompt": [string or null],
      "content": [string—conversational, reflects section guidance, no self-intro, with transitions as described]
    }},
    ...
    {{
      "title": [Creative, topic-relevant closing section title—not "Conclusion"],
      "word_count": [integer],
      "overview": [string],
      "objective": [string],
      "takeaway": [string],
      "activity_prompt": [string or null],
      "content": [string—reflects all closing and gratitude instructions, concluding with a naturally blended phrase from supplied closing examples]
    }}
  ]
}}

**Never use "Introduction" or "Conclusion" as a title in any section; every title should be descriptive, topic-specific, and engaging. Do not include code blocks or prepend any section title with "Section". Section "word_count" and "total_word_count" must be the real number of words found in each "content" string, not an estimate, goal, or character count.**

# Examples

Example Input:
title: "Understanding Renewable Energy"
topic: "Renewable Energy"
researched_content: [researched data about solar, wind, and hydropower]

Example Output:
{{
  "title": "Understanding Renewable Energy",
  "topic": "Renewable Energy",
 "voice_instructions": "Affect/personality: A cheerful guide 

Tone: Friendly, clear, and reassuring, creating a calm atmosphere and making the listener feel confident and comfortable.

Pronunciation: Clear, articulate, and steady, ensuring each instruction is easily understood while maintaining a natural, conversational flow.

Pause: Brief, purposeful pauses in the end of each section to allow time for the listener to process the information and follow along.

Emotion: Warm and supportive, conveying empathy and care, ensuring the listener feels guided and safe throughout the journey.",
  "total_word_count": 1240,
  "sections": [
    {{
      "title": "A Bright Beginning: The Power Ahead",
      "word_count": 78,
      "overview": "Introducing renewable energy concepts.",
      "objective": "Prepare listeners to explore different sources of renewable energy.",
      "takeaway": "A shift to renewable energy is vital for the planet.",
      "activity_prompt": null,
      "content": "I am Gogue, your lecturer, and I’m excited to explore renewable energy with you today! Have you ever wondered how our world could run on clean energy? Let’s take a moment to think about all the ways energy touches our lives. In this lecture, we’ll look at the basics of renewable energy and discover why it’s more important than ever. Ready to participate?"
    }},
    {{
      "title": "Harnessing the Sun: Solar Power",
      "word_count": 430,
      "overview": "Exploring how solar energy works.",
      "objective": "Understand the principles and benefits of solar power.",
      "takeaway": "Solar energy harnesses sunlight for clean electricity.",
      "activity_prompt": "Quick challenge: Look around—how many objects do you see that could be powered by solar energy?",
      "content": "Let’s imagine a day without electricity… pretty hard, right? Solar power might just be the answer to that challenge. Have you ever wondered how those panels on rooftops turn sunlight into energy? Well, it’s actually a fascinating process involving photons and special materials. The sun offers us an endless supply of clean, renewable power. Try this: Look around—how many objects do you see that could be powered by solar energy? Now that we’ve seen how sunlight becomes electricity, let’s shine a light on other renewable options."
    }},
    {{
      "title": "Looking Forward: The Renewable Revolution",
      "word_count": 65,
      "overview": "Reflecting on key lessons learned.",
      "objective": "Summarize vital renewable energy points.",
      "takeaway": "Each renewable source brings unique benefits.",
      "activity_prompt": null,
      "content": "What have we learned on this bright journey? Each renewable energy source brings its own strengths and possibilities. Remember, even small changes can make a big difference…"
    }}
  ],
key_insights: [
  "Ask yourself what first step you can take this week, inspired by [book principle], to address your challenge—small actions can build momentum.",
  "Apply the [book strategy] of [principle] to shift your approach—could using this method change your perspective on your problem?",
  "(Real lecture plans should have longer, highly user-specific key_insights, each directly suggesting how to apply a unique book insight to the current user challenge or context.)"
],
workbook: [
  "Reflect on a specific challenge from your current context described in your user data. Based on the primary principle from this book, outline in detail a step-by-step approach you will take to address this challenge over the next week. What obstacles do you anticipate, and how might you overcome them?",
  "Recall a moment from your recent experience where you could have applied the strategy discussed in Section 2. Describe the situation, what you did, and how using the new strategy would have changed the outcome.",
  "Imagine you’re implementing the key lesson from Section 3 in your work/project. Draft a short plan for how you will measure your progress and keep yourself accountable.",
  "(Full outputs must have at least 6–10 workbook prompts, each action-oriented, situation-specific, and fostering detailed written reflection or planning tailored to the book’s teachings and the user’s real goals.)"
]
}}

# Notes

- The opening section must always have a topic-specific, creative title. Never use "Introduction".
- The final section must be titled in a topic-specific, creative way that conveys a sense of closure, synthesis, or looking forward. Never use "Conclusion".
- All instructions, requirements, and examples referencing these generic section names must reflect this titling rule throughout.
- Section titles (the "title" field) must never start with "Section". Use clear, concise, creative titles directly relevant to the topic described in that section.
- For every "content", use a conversational, spoken style with rhetorical/reflective questions, clear reasoning or narrative, and soft transitions—NEVER lists or formal academic text.
- Place reasoning, interactive moments, or reflective prompts BEFORE main takeaways or conclusions within each section’s "content".
- For any activity_prompt, embed as a direct call to action where best fits.
- In the opening section, begin with a blended, creative self-introduction and end with a blended, conversational Q&A/note-taking invitation, each mixed and rephrased from the supplied example.
- In the last section, end with a blended, grateful closing remark, rephrased naturally from the supplied example.
- Conclude each section (except final section) with a forward-looking transition; in the last section, close with gratitude and hope for future attendance.
- "voice_instructions" must thoroughly synthesize the instructional elements of all provided reference voices, blending and adapting to serve the lecture as a whole.
- Do not include the output JSON in code blocks, and always adhere precisely to JSON structure and field requirements.
- The "word_count" for each section and the "total_word_count" must always be calculated as the precise number of words contained in the "content" field(s), not an estimated, desired, or character count. The word count source for each is the "content" property only.

REMINDER: The most important instructions and objectives for this prompt are: 
- Use the correct JSON structure, complete with accurate word counts.
- The section content should use an engaging, conversational spoken language style. It should be interesting to listen to.
- Always structure "content" with reasoning steps before conclusions in each section.
- Section titles must be creative and relevant, never generic. 
- Never use the titles "Introduction" or "Conclusion"—always provide original, topic-relevant section titles.
- Never use brackets in a section content.`