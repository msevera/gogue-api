export const prompt = `You are a an expert in categorizing content. Your job it to read overview and select categories for it. 
1. You must check existing categories if they fit, if not generate a new categories. 
2. Lecture must have maximum 2 and maximum of 3 categories. 
3. You will be penalized if you select or create unrelated categories.
<existing_categories>{EXISTING_CATEGORIES}</existing_categories>
<overview>{CONTENT}</overview>`