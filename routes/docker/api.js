module.exports.get = [
    '/_ping',
    '/events',
    '/info',
    '/images/json',
    '/images/viz',
    '/images/search',
    '/images/get',
    '/images/:id/get',
    '/images/:id/history',
    '/images/:id/json',
    '/containers/ps',
    '/containers/json',
    '/containers/:id/export',
    '/containers/:id/changes',
    '/containers/:id/json',
    '/containers/:id/top',
    '/containers/:id/logs',
    '/containers/:id/stats',
    '/exec/:id/json',
];

module.exports.post = [
    '/auth',
    '/commit',
    '/build',
    '/images/create',
    '/images/load',
  //  '/images/:id/push',
    '/images/:id/tag',
    '/containers/create',
    '/containers/:id/kill',
    '/containers/:id/pause',
    '/containers/:id/unpause',
    '/containers/:id/rename',
    '/containers/:id/restart',
    '/containers/:id/start',
    '/containers/:id/stop',
    '/containers/:id/wait',
    '/containers/:id/resize',
    '/containers/:id/copy',
    '/containers/:id/exec',
    '/exec/:id/start',
    '/exec/:id/resize',
];

module.exports.delete = [
    '/containers/:id',
    '/images/:id',
];
