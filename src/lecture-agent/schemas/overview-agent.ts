export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "lecture_title",
        "lecture_overview",
        "sections"
      ],
      "properties": {
        "lecture_title": {
          "type": "string",
          "description": "Lecture title"
        },
        "lecture_overview": {
          "type": "string",
          "description": "Lecture overview. Must be 2 sentences short."
        },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "section_title",
              "section_overview"
            ],
            "properties": {
              "section_title": {
                "type": "string",
                "description": "Section title"
              },
              "section_overview": {
                "type": "string",
                "description": "Section overview. Must be one sentence short."
              }
            },
            "additionalProperties": false
          },
          "description": "Lecture over view and sections overview"
        }
      },
      "additionalProperties": false
    }
  }
}