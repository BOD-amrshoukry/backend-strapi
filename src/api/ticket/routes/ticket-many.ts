export default {
  routes: [
    {
      method: 'POST',
      path: '/tickets/soft-delete-many',
      handler: 'ticket.softDeleteMany',
    },
    {
      method: 'POST',
      path: '/tickets/hard-delete-many',
      handler: 'ticket.hardDeleteMany',
    },
    {
      method: 'POST',
      path: '/tickets/restore-many',
      handler: 'ticket.restoreMany',
    },
    {
      method: 'POST',
      path: '/tickets/unassign-many',
      handler: 'ticket.unassignMany',
    },
    {
      method: 'POST',
      path: '/tickets/assign-many',
      handler: 'ticket.assignMany',
    },
    {
      method: 'POST',
      path: '/users/delete-many',
      handler: 'ticket.deleteManyUsers',
    },
    {
      method: 'GET',
      path: '/dashboard/stats',
      handler: 'ticket.stats',
    },
    {
      method: 'GET',
      path: '/dashboard/employee-stats/:id',
      handler: 'ticket.employeeStats',
    },
  ],
};

