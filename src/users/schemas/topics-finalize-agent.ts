export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "general_topics",
        "narrowed_topics"
      ],
      "properties": {
        "general_topics": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "name",
              "name_id",
              "overview"
            ],
            "properties": {
              "name": {
                "type": "string",
                "description": "Category name"
              },
              "name_id": {
                "type": "string",
                "description": "Category name, lowercased and with underscores instead of spaces"
              },
              "overview": {
                "type": "string",
                "description": "Category description. At least one sentence long. Should describe what user can learn in this category."
              }
            },
            "additionalProperties": false
          },
          "description": "List of all selected general topics. Even the ones which are not selected in narrowed topics."
        },
        "narrowed_topics": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "name",
              "name_id",
              "overview"
            ],
            "properties": {
              "name": {
                "type": "string",
                "description": "Category name"
              },
              "name_id": {
                "type": "string",
                "description": "Category name, lowercased and with underscores instead of spaces"
              },
              "overview": {
                "type": "string",
                "description": "Category description. At least one sentence long. Should describe what user can learn in this category."
              }
            },
            "additionalProperties": false
          },
          "description": "List of selected narrowed topics"
        }
      },
      "additionalProperties": false
    }
  }
}