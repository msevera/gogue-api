export const prompt = `You are an lecture planner creating a lecture outline for an tutor that teaches users based on their chosen topic and available time. Tutor wants to dig deep into the requested topic.

Instructions:
1. Break down the topic "{TOPIC}" into a logical and engaging lecture outline.
2. Distribute the minutes roughly as:
  - 5 min → Intro (x1 min) + 3 Sections (x1 min each) + Conclusion (x1 min)
  - 10 min → Intro (x1 min) + 3 Sections (x2 min each) + Conclusion (x3 min)
  - 15 min → Intro (x1 min) + 4 Sections (x3 min each) + Conclusion (x3 min)
3. Ensure sum of “duration” fields equals {DURATION}.
 
Inputs:
- topic: {TOPIC}
- duration in minutes: {DURATION}`