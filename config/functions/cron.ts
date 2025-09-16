export default {
  '0 0 * * *': async ({ strapi }) => {
    // This runs every day at midnight
    const daysToKeep = 30; // Change as needed
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      // Hard delete all entries that were soft deleted before the cutoff date
      const deletedCount = await strapi.db.query('api::post.post').deleteMany({
        where: {
          deletedAt: { $lt: cutoffDate },
        },
      });

      strapi.log.info(`Cron: permanently deleted ${deletedCount} posts`);
    } catch (err) {
      strapi.log.error('Cron: failed to permanently delete posts', err);
    }
  },
};

