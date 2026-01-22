import { Router } from 'express';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Test route
    router.get('/', (req, res) => {
      res.json({
        message: 'Iceplay API v1',
        version: '1.0.0',
        endpoints: {
          auth: '/api/v1/auth',
          organizations: '/api/v1/organizations',
          championships: '/api/v1/championships',
          teams: '/api/v1/teams',
          players: '/api/v1/players',
          matches: '/api/v1/matches',
          events: '/api/v1/events',
          standings: '/api/v1/standings',
        },
      });
    });

    // Auth routes
    // router.use('/auth', AuthRoutes.routes);

    // Organization routes
    // router.use('/organizations', OrganizationRoutes.routes);

    // Championship routes
    // router.use('/championships', ChampionshipRoutes.routes);

    // Team routes
    // router.use('/teams', TeamRoutes.routes);

    // Player routes
    // router.use('/players', PlayerRoutes.routes);

    // Match routes
    // router.use('/matches', MatchRoutes.routes);

    // Event routes
    // router.use('/events', EventRoutes.routes);

    // Standing routes
    // router.use('/standings', StandingRoutes.routes);

    return router;
  }
}
