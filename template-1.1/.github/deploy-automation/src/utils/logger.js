/**
 * シンプルなロガー
 */
export const logger = {
  info(message, ...args) {
    console.log(`ℹ️ ${message}`, ...args);
  },

  success(message, ...args) {
    console.log(`✅ ${message}`, ...args);
  },

  warn(message, ...args) {
    console.warn(`⚠️ ${message}`, ...args);
  },

  error(message, ...args) {
    console.error(`❌ ${message}`, ...args);
  },

  debug(message, ...args) {
    if (process.env.DEBUG) {
      console.log(`🔍 ${message}`, ...args);
    }
  },

  step(step, message) {
    console.log(`\n📍 Step ${step}: ${message}`);
  },

  divider() {
    console.log('─'.repeat(50));
  }
};

export default logger;
