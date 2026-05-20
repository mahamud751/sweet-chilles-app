/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

/** Lazy load so registration always runs even if App has a load error later. */
function loadRoot() {
  return require('./App').default;
}

const NAMES = new Set([
  appName,
  'SweetChillies',
  'BrainQuestAllsIsland',
]);

for (const name of NAMES) {
  AppRegistry.registerComponent(name, loadRoot);
}
