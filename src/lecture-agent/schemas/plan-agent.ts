export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
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
              "duration"
            ],
            "properties": {
              "title": {
                "type": "string",
                "description": "Section title"
              },
              "duration": {
                "type": "number",
                "description": "Duration in minutes"
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
}