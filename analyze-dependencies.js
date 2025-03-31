/**
 * Dependency Analyzer for Flight App
 * 
 * This script scans your codebase and creates a visual representation
 * of which files are imported by which other files to help identify
 * what's actually needed for your application to function.
 */

const fs = require('fs');
const path = require('path');

// Track files and their dependencies
const dependencies = new Map();
// Track files that are imported by others
const isImported = new Set();
// Files to ignore (e.g., node_modules, .git)
const ignoreDirs = ['node_modules', '.git', 'build', '.vercel', '.next'];

// Import/require patterns to search for
const importPatterns = [
  /import\s+.*from\s+['"]([^'"]+)['"]/g,           // ES6 imports
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,           // Dynamic imports
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,          // CommonJS require
  /import\s+['"]([^'"]+)['"]/g                      // Side-effect imports
];

/**
 * Resolves a relative import path to an absolute path
 */
function resolveImportPath(importPath, currentFilePath) {
  // Handle node_modules imports
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return `node_modules:${importPath}`;
  }
  
  // Handle relative paths
  let resolvedPath;
  if (importPath.startsWith('.')) {
    const currentDir = path.dirname(currentFilePath);
    resolvedPath = path.join(currentDir, importPath);
  } else {
    // Absolute path
    resolvedPath = importPath;
  }
  
  // If no extension, try to resolve it
  if (!path.extname(resolvedPath)) {
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    for (const ext of extensions) {
      const withExt = `${resolvedPath}${ext}`;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
    
    // Check if it's a directory with an index file
    const indexFiles = extensions.map(ext => path.join(resolvedPath, `index${ext}`));
    for (const indexFile of indexFiles) {
      if (fs.existsSync(indexFile)) {
        return indexFile;
      }
    }
  }
  
  return resolvedPath;
}

/**
 * Analyze a single file for imports
 */
function analyzeFile(filePath) {
  try {
    // Skip already processed files
    if (dependencies.has(filePath)) {
      return;
    }
    
    console.log(`Analyzing: ${filePath}`);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const importedFiles = new Set();
    
    // Find all imports
    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        const resolved = resolveImportPath(importPath, filePath);
        importedFiles.add(resolved);
        isImported.add(resolved);
      }
    }
    
    // Store dependencies
    dependencies.set(filePath, Array.from(importedFiles));
    
    // Recursively process imported files (if they exist and are in our project)
    for (const importedFile of importedFiles) {
      if (!importedFile.startsWith('node_modules:') && fs.existsSync(importedFile)) {
        analyzeFile(importedFile);
      }
    }
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
  }
}

/**
 * Scan a directory recursively
 */
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip ignored directories
      if (entry.isDirectory() && ignoreDirs.includes(entry.name)) {
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        analyzeFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
}

// Entry points to scan (API routes and client app)
const entryPoints = [
  path.join(__dirname, 'api/events/index.js'),
  path.join(__dirname, 'api/flights/index.js'),
  path.join(__dirname, 'api/power-automate/index.js'),
  path.join(__dirname, 'client/src/App.js')
];

// Process each entry point
for (const entryPoint of entryPoints) {
  analyzeFile(entryPoint);
}

// Generate summary report
console.log('\n=== FILES USED IN YOUR APPLICATION ===');
console.log('Entry Points:');
entryPoints.forEach(ep => console.log(`- ${ep}`));

console.log('\nDependency Chain:');
dependencies.forEach((imports, file) => {
  console.log(`\n${file} imports:`);
  imports.forEach(imp => console.log(`  - ${imp}`));
});

console.log('\n=== UNUSED FILES ===');
// Scan the whole project to find files
const allFiles = [];
function findAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory() && !ignoreDirs.includes(entry.name)) {
      findAllFiles(path.join(dir, entry.name));
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      allFiles.push(path.join(dir, entry.name));
    }
  }
}

findAllFiles(__dirname);

const unusedFiles = allFiles.filter(file => 
  !dependencies.has(file) && !isImported.has(file)
);

console.log('The following files appear to be unused:');
unusedFiles.forEach(file => console.log(`- ${file}`));

// Output everything to a file for reference
const output = {
  entryPoints,
  dependencies: Object.fromEntries(dependencies),
  unusedFiles,
};

fs.writeFileSync(
  path.join(__dirname, 'dependency-analysis.json'), 
  JSON.stringify(output, null, 2)
);

console.log('\nAnalysis complete! Check dependency-analysis.json for details');
