export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "The title of the lecture."
        },
        "topic": {
          "type": "string",
          "description": "The overall topic of the lecture."
        },
        "overview": {
          "type": "string",
          "description": "Brief overview of the entire lecture. Must contain at least 2 sentences."
        },
        "total_word_count": {
          "type": "integer",
          "description": "Total word count of the lecture plan, calculated from all section content fields.",
          "minimum": 0
        },
        "voice_instructions": {
          "type": "string",
          "description": "Instructions for voice delivery for the entire lecture (e.g., tone, emphasis)."
        },
        "sections": {
          "type": "array",
          "description": "Ordered list of sections in the lecture.",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string",
                "description": "The section title (e.g. Introduction, Conclusion, or a main section title)."
              },
              "word_count": {
                "type": "integer",
                "description": "Word count for this section, calculated from the content field.",
                "minimum": 0
              },
              "overview": {
                "type": "string",
                "description": "Brief overview of what this section covers."
              },
              "objective": {
                "type": "string",
                "description": "Learning objective for this section."
              },
              "takeaway": {
                "type": "string",
                "description": "Core lesson or insight students should retain from this section."
              },
              "activity_prompt": {
                "anyOf": [
                  {
                    "type": "string",
                    "description": "Optional prompt for activity related to the section."
                  },
                  {
                    "type": "null",
                    "description": "If no activity prompt is provided."
                  }
                ]
              },
              "content": {
                "type": "string",
                "description": "Main written content for the section."
              }
            },
            "required": [
              "title",
              "word_count",
              "overview",
              "objective",
              "takeaway",
              "activity_prompt",
              "content"
            ],
            "additionalProperties": false
          }
        }
      },
      "required": [
        "title",
        "topic",
        "overview",
        "total_word_count",
        "voice_instructions",
        "sections"
      ],
      "additionalProperties": false
    }
  }
}