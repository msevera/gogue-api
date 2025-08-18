const slugify = require('slug').default;

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const lectures = db.collection('lectures');
    
    // Get all lectures that don't have a slug but have a topic
    const lecturesWithoutSlug = await lectures.find({
      topic: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    }).toArray();

    console.log(`Found ${lecturesWithoutSlug.length} lectures without slug`);

    // Process each lecture to generate a unique slug
    for (const lecture of lecturesWithoutSlug) {
      const baseSlug = slugify(lecture.topic, { lower: true });
      
      // Find all existing slugs starting with baseSlug (excluding current lecture)
      const existing = await lectures.find({
        slug: { $regex: `^${baseSlug}(-[0-9]+)?$`, $options: 'i' },
        _id: { $ne: lecture._id }
      }).project({ slug: 1 }).toArray();

      let finalSlug = baseSlug;
      
      if (existing.length > 0) {
        let maxNum = 0;
        existing.forEach((doc) => {
          const match = doc.slug.match(/-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        finalSlug = `${baseSlug}-${maxNum + 1}`;
      }

      // Update the lecture with the generated slug
      await lectures.updateOne(
        { _id: lecture._id },
        { $set: { slug: finalSlug } }
      );

      console.log(`Updated lecture ${lecture._id} with slug: ${finalSlug}`);
    }

    console.log('Migration completed successfully');
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Remove slug field from all lectures
    await db.collection('lectures').updateMany(
      { slug: { $exists: true } },
      { $unset: { slug: "" } }
    );
    console.log('Rollback completed - removed slug field from all lectures');
  }
};
