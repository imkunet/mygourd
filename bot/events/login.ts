import consola from 'consola';
import { createEventRouter } from 'mygourd/events';

export default createEventRouter({
  ready: () => {
    consola.info(`The bot is ready!`);
  },
});
