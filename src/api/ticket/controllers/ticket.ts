import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::ticket.ticket',
  ({ strapi }) => ({
    // Soft delete multiple tickets
    async softDeleteMany(ctx) {
      const { documentIds } = ctx.request.body;

      if (!documentIds?.length) {
        return ctx.badRequest('Please provide an array of documentIds');
      }

      try {
        const currentTime = new Date().toISOString();
        const updatedCount = await strapi.db
          .query('api::ticket.ticket')
          .updateMany({
            where: { documentId: { $in: documentIds } },
            data: { deletedAt: currentTime },
          });

        return ctx.send({
          message: `${updatedCount} tickets soft-deleted successfully`,
          softDeletedDocumentIds: documentIds,
        });
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to soft-delete tickets');
      }
    },

    // Hard delete multiple tickets
    async hardDeleteMany(ctx) {
      const { documentIds } = ctx.request.body;

      if (!documentIds?.length) {
        return ctx.badRequest('Please provide an array of documentIds');
      }

      try {
        const deletedCount = await strapi.db
          .query('api::ticket.ticket')
          .deleteMany({
            where: { documentId: { $in: documentIds } },
          });

        return ctx.send({
          message: `${deletedCount} tickets permanently deleted`,
          hardDeletedDocumentIds: documentIds,
        });
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to hard-delete tickets');
      }
    },

    // Restore multiple tickets
    async restoreMany(ctx) {
      const { documentIds } = ctx.request.body;

      if (!documentIds?.length) {
        return ctx.badRequest('Please provide an array of documentIds');
      }

      try {
        const restoredCount = await strapi.db
          .query('api::ticket.ticket')
          .updateMany({
            where: { documentId: { $in: documentIds } },
            data: { deletedAt: null },
          });

        return ctx.send({
          message: `${restoredCount} tickets restored successfully`,
          restoredDocumentIds: documentIds,
        });
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to restore tickets');
      }
    },

    async unassignMany(ctx) {
      const { documentIds } = ctx.request.body;

      if (!documentIds?.length) {
        return ctx.badRequest('Please provide an array of documentIds');
      }

      try {
        let updatedCount = 0;

        for (const id of documentIds) {
          const updated = await strapi.db.query('api::ticket.ticket').update({
            where: { documentId: id },
            data: {
              user: null, // for one-to-many
            },
          });

          if (updated) updatedCount++;
        }

        return ctx.send({
          message: `${updatedCount} tickets unassigned successfully`,
          unassignedDocumentIds: documentIds,
        });
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to unassign tickets');
      }
    },

    async assignMany(ctx) {
      const { documentIds, userId } = ctx.request.body;

      if (!documentIds?.length || !userId) {
        return ctx.badRequest('Please provide documentIds and userId');
      }

      try {
        let updatedCount = 0;

        for (const id of documentIds) {
          const updated = await strapi.db.query('api::ticket.ticket').update({
            where: { documentId: id },
            data: {
              user: userId, // assign this ticket to the user
            },
          });

          if (updated) updatedCount++;
        }

        return ctx.send({
          message: `${updatedCount} tickets assigned to user ${userId} successfully`,
          assignedDocumentIds: documentIds,
        });
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to assign tickets');
      }
    },
    async deleteManyUsers(ctx) {
      const { userIds } = ctx.request.body;

      if (!userIds?.length) {
        return ctx.badRequest('Please provide an array of userIds');
      }

      try {
        const deletedCount = await strapi.db
          .query('plugin::users-permissions.user')
          .deleteMany({
            where: { id: { $in: userIds } },
          });

        return ctx.send({
          message: `${deletedCount} users permanently deleted`,
          hardDeletedUserIds: userIds,
        });
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to hard-delete users');
      }
    },

    async stats(ctx) {
      try {
        // Total employees and managers
        const totalEmployees = await strapi.db
          .query('plugin::users-permissions.user')
          .count({
            where: { type: 'employee' },
          });

        const totalManagers = await strapi.db
          .query('plugin::users-permissions.user')
          .count({
            where: { type: 'manager' },
          });

        // Total tickets & by state
        const totalTickets = await strapi.db
          .query('api::ticket.ticket')
          .count();

        const openTickets = await strapi.db.query('api::ticket.ticket').count({
          where: { state: 'open' },
        });

        const pendingTickets = await strapi.db
          .query('api::ticket.ticket')
          .count({
            where: { state: 'pending' },
          });

        const closedTickets = await strapi.db
          .query('api::ticket.ticket')
          .count({
            where: { state: 'completed' },
          });

        // Unassigned tickets
        const unassignedTickets = await strapi.db
          .query('api::ticket.ticket')
          .count({
            where: { user: null },
          });

        // Top 5 employees by tickets
        const topEmployees = await strapi.db
          .query('plugin::users-permissions.user')
          .findMany({
            where: { type: 'employee' },
            populate: ['tickets'],
          });

        const topEmployeesData = topEmployees
          .map((e) => ({ name: e.username, ticketCount: e.tickets.length }))
          .sort((a, b) => b.ticketCount - a.ticketCount)
          .slice(0, 5);

        // Employees without tickets
        const employeesWithoutTickets = topEmployees.filter(
          (e) => e.tickets.length === 0,
        ).length;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ticketsPerDayRaw = await strapi.db
          .connection('tickets')
          .select(strapi.db.connection.raw('DATE(created_at) as date')) // ✅ use created_at
          .count('* as count')
          .where('created_at', '>=', sevenDaysAgo)
          .groupBy('date')
          .orderBy('date', 'asc');

        const ticketsPerDay = ticketsPerDayRaw.map((r) => ({
          date: r.date, // now will have actual date string
          count: Number(r.count),
        }));

        // Percentage unassigned tickets
        const unassignedPercentage = totalTickets
          ? (unassignedTickets / totalTickets) * 100
          : 0;

        const deletedTickets = await strapi.db
          .query('api::ticket.ticket')
          .count({
            where: { deletedAt: { $notNull: true } },
          });

        ctx.send({
          employees: totalEmployees,
          managers: totalManagers,
          tickets: {
            total: totalTickets,
            byState: {
              open: openTickets,
              pending: pendingTickets,
              completed: closedTickets,
            },
            deleted: deletedTickets,
            unassigned: unassignedTickets,
            unassignedPercentage,
            topEmployees: topEmployeesData,
            employeesWithoutTickets,
            ticketsPerDay,
          },
        });
      } catch (err) {
        console.error(err);
        ctx.internalServerError('Failed to fetch dashboard stats');
      }
    },

    async employeeStats(ctx) {
      try {
        const { id } = ctx.params; // employee ID from URL

        // Total tickets assigned to this employee
        const totalTickets = await strapi.db
          .connection('tickets_user_lnk')
          .count('ticket_id as count')
          .where('user_id', id)
          .first();

        // Tickets by state
        const ticketsByState = await strapi.db
          .connection('tickets_user_lnk as tlnk')
          .join('tickets as t', 'tlnk.ticket_id', 't.id')
          .select('t.state')
          .count('t.id as count')
          .where('tlnk.user_id', id)
          .groupBy('t.state');

        const allEmployees = await strapi.db
          .connection('tickets_user_lnk')
          .select('user_id')
          .count('ticket_id as ticketCount')
          .groupBy('user_id')
          .orderBy('ticketCount', 'desc');

        // Find the rank of the current employee
        const rank = allEmployees.findIndex((emp) => emp.user_id == id) + 1;

        ctx.send({
          employeeId: id,
          totalTickets: totalTickets.count,
          ticketsByState,
          rank,
        });
      } catch (err) {
        console.error(err);
        ctx.internalServerError('Failed to fetch employee stats');
      }
    },
  }),
);

