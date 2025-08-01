export const prompt = `Research the specified topic using reliable, real sources from the internet. Carefully review the provided title, description, and objectives to understand the research focus and requirements. Use this information to guide your search for accurate and up-to-date content. Synthesize the information found and ensure your response is comprehensive, fact-based, and relevant to the objectives.

- Begin by analyzing the title, description, and objectives to clarify what the research should address.
- Search reputable online sources (such as academic publications, reputable news organizations, government or institutional websites, expert interviews, whitepapers, or industry-leading sources) for information relevant to the topic.
- Evaluate sources for credibility and accuracy. Prefer up-to-date and authoritative references.
- Take notes on key facts, data, developments, and relevant context. Reflect on how each piece of information addresses the objectives.
- Synthesize your findings into a cohesive, logically organized piece of plain text. Do not simply copy and paste material; rewrite and summarize in your own words.
- Do not include a summary, restatement of objectives, or repeat the title or description in your output. Deliver *only* the content of your research.
- Do not cite sources directly in the main text; the text should read as a seamless, original synthesis. (If required, a list of references can follow in plaintext, but do not include them unless requested.)

Output Format:  
Plain text paragraph(s) containing the synthesized research. Do not include any headings, titles, objectives, or source lists unless specifically instructed.

Example:  
Title: [The Rise of Renewable Energy in Europe]  
Description: [A study of how renewable energy sources have expanded in Europe over the past two decades, key drivers, and leading countries.]  
Objectives: [Identify main trends, significant policies, and future outlook.]

Expected Output:  
Over the last twenty years, Europe has experienced significant growth in the adoption of renewable energy sources, driven primarily by policy initiatives, investment in innovation, and a strong commitment to reducing carbon emissions. Countries such as Germany and Denmark have led the way, implementing ambitious targets and incentives for wind and solar power. The European Union’s Renewable Energy Directive set binding targets that catalyzed national efforts. Advances in technology, as well as falling costs in solar photovoltaic and wind energy generation, have further accelerated the shift towards renewables. Looking forward, the region aims to increase the share of renewables in its energy mix, focusing on grid integration, cross-border cooperation, and continued investment to meet climate goals.

(If a real example were longer/more complex, use multiple paragraphs covering each objective in more depth. Placeholders for title, description, and objectives should always be replaced by real instructions.)

Important:  
- Do not include the research task, title, objective, or description in your output.  
- Ensure all information is based on real, credible sources from the internet.  
- Write in a clear, objective, and synthesized manner.  

**REMINDER:**  
- Research the topic guided by the title, description, and objectives.  
- Output only synthesized content as plain text—no headings, no title, no objective restatement.  
- Use reputable real-world sources for information.

<title>{title}</title>
<description>{description}</description>
<category>{category}</category>
<current_timestamp>{current_timestamp}</current_timestamp>`
