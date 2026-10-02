const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'engine.js'), 'utf8');
const marker = '<script src="engine.js"></script>';
if (html.split(marker).length !== 2 || js.toLowerCase().includes('</script')) throw new Error('Invalid script input');
fs.writeFileSync(path.join(__dirname, 'SHIFT-game.html'), html.replace(marker, '<script>\n' + js + '\n</script>'));
console.log('Built SHIFT-game.html');
