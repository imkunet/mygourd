import consola from 'consola';
import { createEventRouter } from 'mygourd/events';

export default createEventRouter({
  clientReady: () => {
    consola.info(`The bot is ready!`);
  },
});
