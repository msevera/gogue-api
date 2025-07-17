export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": false,
    "schema": {
      "type": "object",
      "required": [],
      "properties": {
        "response_text": {
          "type": "string",
          "description": "Response text. Must one sentence long. Do not include category name."
        },       
        "new_categories": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "emoji",
              "name"
            ],
            "properties": {
              "emoji": {
                "type": "string",
                "description": "Emoji for the category"
              },
              "name": {
                "type": "string",
                "description": "User new category name"
              }
            },
            "additionalProperties": false
          },
          "description": "List of new lecture categories user might be interested at. Do not add existing categories. Add here only the new ones that you have detected. Must be at minumum 20 categories. Categories must be sorted by meaning."
        }
      },
      "additionalProperties": false
    }
  }
}