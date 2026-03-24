/**
 * ロガー
 */
export function createLogger(prefix = '') {
  return {
    info: (message) => {
      console.log(`${prefix ? `[${prefix}] ` : ''}${message}`);
    },
    error: (message, error) => {
      console.error(`${prefix ? `[${prefix}] ` : ''}ERROR: ${message}`);
      if (error) {
        console.error(error);
      }
    },
    warn: (message) => {
      console.warn(`${prefix ? `[${prefix}] ` : ''}WARN: ${message}`);
    },
    debug: (message) => {
      if (process.env.DEBUG) {
        console.log(`${prefix ? `[${prefix}] ` : ''}DEBUG: ${message}`);
      }
    }
  };
}
