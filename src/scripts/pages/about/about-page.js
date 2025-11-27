export default class AboutPage {
  async render() {
    return `
      <section class="container" id="main-content-section" tabindex="-1">
        <h1>About Page</h1>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
