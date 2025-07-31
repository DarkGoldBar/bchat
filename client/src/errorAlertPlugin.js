// errorAlertPlugin.js
export default {
  install(app, options = {}) {
    const showAlert = (title, message) => {
      if (typeof window !== 'undefined') {
        alert(`${title}\n${message}`);
      }
    };

    // Vue 组件内错误
    app.config.errorHandler = (err, instance, info) => {
      const msg = err?.message || String(err);
      showAlert('Vue Error', `${msg}\n\nInfo: ${info}`);
      console.error('[Vue Error]', err, info);
    };

    // 普通 JS 错误
    window.onerror = (message, source, lineno, colno, error) => {
      showAlert('JS Error', `${message}\n${source}:${lineno}:${colno}`);
      console.error('[JS Error]', message, source, lineno, colno, error);
      return false; // 不阻止默认控制台输出
    };

    // Promise 未捕获错误
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event?.reason?.message || event.reason || 'Unknown';
      showAlert('Promise Error', String(reason));
      console.error('[Promise Error]', event.reason);
    });
  }
};
