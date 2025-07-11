export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "interes_topics"
      ],
      "properties": {
        "interes_topics": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
               "id",
              "name",
              "overview"             
            ],
            "properties": {
              "id": {
                "type": "string",
                "description": "Topic id. If topic already exists, use it. If not, leave field empty."
              },
              "name": {
                "type": "string",
                "description": "Topic name"
              },
              "overview": {
                "type": "string",
                "description": "Topic description. At least one sentence long"
              }
            },
            "additionalProperties": false
          },
          "description": "List of interest topics"
        }
      },
      "additionalProperties": false
    }
  }
}