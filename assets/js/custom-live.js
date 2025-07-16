class CloudCannonLive {
  constructor(renderFn) {
    this.renderFn = renderFn;
    this.data = {};
    this.init();
  }

  init() {
    console.log("???");
    document.addEventListener("cloudcannon:load", (e) => {
      this.onCloudCannonLoad(e.detail.CloudCannon);
    });

    document.addEventListener("cloudcannon:update", (e) => {
      this.loadNewPropsFromCloudCannon(e.detail.CloudCannon);
    });

    if (window.CloudCannon) {
      this.onCloudCannonLoad(window.CloudCannon);
    }
  }

  async loadNewPropsFromCloudCannon(CloudCannon) {
    try {
      const latest = await CloudCannon.value();
      console.log(latest);
      this.data = latest;
      this.renderFn(this.data);
    } catch (err) {
      console.warn("Failed to fetch updated content", err);
    }
  }

  onCloudCannonLoad(CloudCannon) {
    CloudCannon.enableEvents();
    this.loadNewPropsFromCloudCannon(CloudCannon);
  }
}
