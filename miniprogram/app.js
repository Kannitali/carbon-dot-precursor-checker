App({
  globalData: {
    source: 'OpenAlex',
    version: '1.0.0',
    // 填入云开发环境 ID（如 xxx-1a2b3c4d）即自动走云函数中转；
    // 留空则用 wx.request 直连，仅适合开发者工具调试阶段。
    cloudEnv: ''
  },
  onLaunch: function () {
    if (this.globalData.cloudEnv && wx.cloud) {
      wx.cloud.init({ env: this.globalData.cloudEnv, traceUser: true });
    }
  }
});
