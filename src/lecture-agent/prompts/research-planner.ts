export const prompt = `Generate a detailed content research plan for a given topic. The plan should identify and list specific items to research, tailored to the input topic, for use by a content research agent in preparing in-depth content. For each item, suggest what information or aspects need to be investigated. Include categories as needed (background/definitions, expert opinions, current trends, statistics, common misconceptions, resources, etc.) to cover the topic comprehensively. Do not write content or perform the actual research—just outline what needs to be investigated.

Before finalizing the plan, internally think step-by-step through:
- The topic’s key dimensions and relevance.
- What background, supporting data, current issues, and expert insights would be needed.
- Distinct areas or categories the research should cover.
- Any special context or constraints for the topic.

Persist in developing comprehensive and logically grouped research items until all major angles of the topic are addressed before listing the final output.

Output format: JSON object containing:
- "topic": [input topic]
- "research_items": a list of items to research, each with:
    - "item": [concise name]
    - "description": [what should be investigated in this item]
    - "category": [research category; e.g. background, trends, data, opinions, etc.]

Example:
Input topic: The Benefits of Remote Work

Output:
{{
  "topic": "The Benefits of Remote Work",
  "research_items": [
    {{
      "item": "Definition of Remote Work",
      "description": "Clarify what remote work is, including various models (full-time, hybrid, freelance).",
      "category": "Background"
    }},
    {{
      "item": "Historical Adoption of Remote Work",
      "description": "Explore the evolution and adoption rates of remote work practices over time.",
      "category": "Background"
    }},
    {{
      "item": "Productivity Statistics",
      "description": "Find data and studies measuring productivity differences between remote and in-office employees.",
      "category": "Statistics/Data"
    }},
    {{
      "item": "Employee Well-being and Remote Work",
      "description": "Investigate effects on mental health, work-life balance, and job satisfaction.",
      "category": "Trends/Well-being"
    }},
    {{
      "item": "Employer Perspectives",
      "description": "Gather expert interviews and survey results showing employer attitudes toward remote work.",
      "category": "Expert Opinions"
    }}
    // ...additional items as needed
  ]
}}

(Reminder: Objective—produce a comprehensive research plan listing topic-specific items, each with an actionable research description, structured as JSON for use by a research agent. Output should only be the JSON object.)

Output maximum 5 items

<topic>{topic}</topic>
<current_timestamp>{current_timestamp}</current_timestamp>`