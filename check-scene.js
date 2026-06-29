// Navigate to page and check Three.js scene
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const page = contexts[0].pages()[0];
  
  const result = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas found' };
    
    // Access Three.js internals via fiber
    const fiber = canvas._fiber;
    if (!fiber) return { error: 'No fiber found on canvas' };
    
    // Get scene from fiber root
    const scene = fiber?.root?.scene;
    if (!scene) return { error: 'No scene in fiber root' };
    
    // Count children
    const countChildren = (obj, depth = 0) => {
      const info = {
        type: obj.type,
        name: obj.name || '(unnamed)',
        visible: obj.visible,
        children: obj.children.length,
      };
      if (obj.geometry) {
        info.geometry = obj.geometry.type;
      }
      if (obj.material) {
        info.material = obj.material.type;
        info.materialVisible = obj.material.visible;
      }
      if (depth < 3 && obj.children.length > 0) {
        info.childrenDetails = obj.children.map(c => countChildren(c, depth + 1));
      }
      return info;
    };
    
    return {
      scene: countChildren(scene),
      cameraPosition: fiber.root.camera?.position,
    };
  });
  
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
