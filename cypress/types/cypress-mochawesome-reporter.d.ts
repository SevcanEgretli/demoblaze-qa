/**
 * cypress-mochawesome-reporter ships no types for its /plugin subpath.
 */
declare module 'cypress-mochawesome-reporter/plugin' {
  const plugin: (on: Cypress.PluginEvents) => void;
  export default plugin;
}
