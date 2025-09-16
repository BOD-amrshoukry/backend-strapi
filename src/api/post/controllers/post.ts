import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::post.post',
  ({ strapi }) => ({
    // Make sure the function name matches what you use in the route
    async deleteManyByDocumentId(ctx) {
      const { documentIds } = ctx.request.body;

      if (
        !documentIds ||
        !Array.isArray(documentIds) ||
        documentIds.length === 0
      ) {
        return ctx.badRequest('Please provide an array of documentIds');
      }

      try {
        const deletedCount = await strapi.db
          .query('api::post.post')
          .deleteMany({
            where: { documentId: { $in: documentIds } },
          });

        return ctx.send({
          message: `${deletedCount} posts deleted successfully`,
          deletedDocumentIds: documentIds,
        });
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to delete posts');
      }
    },
  }),
);

