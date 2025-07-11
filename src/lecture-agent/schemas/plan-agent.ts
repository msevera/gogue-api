export const responseSchema = {
  "name": "response_schema",
  "type": "json_schema",
  "strict": true,
  "schema": {
    "type": "object",
    "required": [
      "title",
      "sections"
    ],
    "properties": {
      "title": {
        "type": "string",
        "description": "Lecture title"
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "title",
            "duration",
            "overview"
          ],
          "properties": {
            "title": {
              "type": "string",
              "description": "Section title"
            },
            "duration": {
              "type": "number",
              "description": "Duration in minutes"
            },
            "overview": {
              "type": "string",
              "description": "Brief overview of the section. Make with ing endings"
            }
          },
          "additionalProperties": false
        },
        "description": "Lecture outline with sections that add up exactly to the chosen duration"
      }
    },
    "additionalProperties": false
  }
}