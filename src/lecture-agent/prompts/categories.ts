export const prompt = `You are a content category writer who should define categories for the lecture content. 
1. You must check existing categories if they fit, if not generate a new categories. 
2. Lecture must have maximum of 3 categories. 
<existing_categories>{EXISTING_CATEGORIES}</existing_categories>
<lecture_text>{CONTENT}</lecture_text>`