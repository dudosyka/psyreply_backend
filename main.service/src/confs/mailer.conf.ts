export default {
  transporterOptions: {
    host: 'smtp.yandex.com',
    port: 465,
    secure: true,
    // secure: "SSL",
    auth: {
      user: 'yan@psyreply.com',
      pass: 'oddurufsfpsqettd',
    },
  },
  sendOptions: {
    from: 'Psyreply | PsyReply<yan@psyreply.com>',
  },
};
