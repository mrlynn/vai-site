#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const packagesDir = path.resolve(__dirname, '../../vai-workflows/packages');
const outFile = path.resolve(__dirname, '../src/data/workflows.json');

function computeLayers(steps) {
  // Build dependency graph from template references like {{ stepId.output... }}
  const stepIds = steps.map(s => s.id);
  const deps = {};
  for (const step of steps) {
    deps[step.id] = [];
    const str = JSON.stringify(step.inputs || {});
    for (const id of stepIds) {
      if (id !== step.id && str.includes(`{{ ${id}.`)) {
        deps[step.id].push(id);
      }
    }
  }
  // Topological layer assignment
  const layers = {};
  function getLayer(id, visited = new Set()) {
    if (layers[id] !== undefined) return layers[id];
    if (visited.has(id)) return 0;
    visited.add(id);
    if (deps[id].length === 0) return (layers[id] = 0);
    return (layers[id] = 1 + Math.max(...deps[id].map(d => getLayer(d, visited))));
  }
  stepIds.forEach(id => getLayer(id));
  return Math.max(0, ...Object.values(layers)) + 1;
}

const dirs = fs.readdirSync(packagesDir).filter(d => d.startsWith('vai-workflow-')).sort();
const workflows = [];

for (const dir of dirs) {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  const wfPath = path.join(packagesDir, dir, 'workflow.json');
  if (!fs.existsSync(pkgPath) || !fs.existsSync(wfPath)) continue;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
  const vai = pkg.vai || pkg['vai-workflow'] || {};
  const slug = dir.replace('vai-workflow-', '');

  workflows.push({
    name: pkg.name,
    slug,
    description: wf.description || pkg.description || '',
    version: pkg.version || wf.version || '1.0.0',
    category: vai.category || 'utility',
    tags: vai.tags || [],
    tools: vai.tools || [],
    minVaiVersion: vai.minVaiVersion || '1.0.0',
    stepsCount: (wf.steps || []).length,
    layersCount: computeLayers(wf.steps || []),
    inputs: wf.inputs || {},
    steps: (wf.steps || []).map(s => ({ id: s.id, tool: s.tool, name: s.name })),
  });
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(workflows, null, 2));
console.log(`Generated ${workflows.length} workflows → ${outFile}`);
