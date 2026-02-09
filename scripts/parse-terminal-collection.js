#!/usr/bin/env node

/**
 * Terminal Postman Collection Parser
 * 
 * Parses the Terminal API Postman collection and generates:
 * - Complete API catalog (JSON)
 * - Human-readable API summary (Markdown)
 * - Endpoint list (JSON)
 * - Verizon Connect mapping (JSON)
 * - SambaSafety integration points (JSON)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const COLLECTION_PATH = path.join(__dirname, '../postman/terminal.postman_collection.json');
const OUTPUT_DIR = path.join(__dirname, '../api-collection');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load Postman collection
console.log('📖 Loading Terminal Postman collection...');
const collection = JSON.parse(fs.readFileSync(COLLECTION_PATH, 'utf8'));

// Parse collection
const apiCatalog = {
  name: 'Terminal API',
  version: '1.0',
  baseUrl: 'https://api.terminal.co',
  categories: []
};

const endpointList = [];
const verizonConnectMapping = [];
const sambasafetyIntegration = [];

// Process each category
collection.item.forEach(category => {
  console.log(`\n📂 Processing category: ${category.name}`);
  
  const categoryData = {
    name: category.name,
    description: category.description?.content || '',
    endpoints: []
  };
  
  // Process each endpoint in category
  if (category.item) {
    category.item.forEach(endpoint => {
      const request = endpoint.request;
      
      if (!request) return;
      
      const endpointData = {
        name: endpoint.name,
        description: request.description?.content || '',
        method: request.method,
        path: '/' + (request.url.path || []).join('/'),
        parameters: {
          query: (request.url.query || []).map(q => ({
            key: q.key,
            description: q.description?.content || '',
            required: !q.disabled,
            example: q.value
          })),
          path: (request.url.variable || []).map(v => ({
            key: v.key,
            description: v.description || '',
            example: v.value
          })),
          headers: (request.header || []).map(h => ({
            key: h.key,
            value: h.value,
            description: h.description || ''
          }))
        },
        body: request.body ? {
          mode: request.body.mode,
          raw: request.body.raw,
          options: request.body.options
        } : null,
        responses: endpoint.response || []
      };
      
      categoryData.endpoints.push(endpointData);
      
      // Add to flat endpoint list
      endpointList.push({
        category: category.name,
        name: endpoint.name,
        method: request.method,
        path: endpointData.path
      });
      
      console.log(`  ✅ ${request.method} ${endpointData.path}`);
    });
  }
  
  apiCatalog.categories.push(categoryData);
});

// Generate Verizon Connect mapping
console.log('\n🔗 Generating Verizon Connect mapping...');
const vcMappings = [
  {
    verizonConnect: 'GET /cmd/v1/drivers',
    terminal: 'GET /drivers',
    status: 'REPLACE',
    notes: 'Terminal provides normalized driver data across all TSPs'
  },
  {
    verizonConnect: 'GET /cmd/v1/vehicles',
    terminal: 'GET /vehicles',
    status: 'REPLACE',
    notes: 'Terminal provides normalized vehicle data'
  },
  {
    verizonConnect: 'POST /rad/v1/vehicles/locations',
    terminal: 'GET /vehicles/locations/latest',
    status: 'REPLACE',
    notes: 'Terminal uses GET instead of POST'
  },
  {
    verizonConnect: 'GET /logbook/v1/driver/{drivernumber}/statuscurrent',
    terminal: 'GET /hos/available-time',
    status: 'REPLACE',
    notes: 'Terminal provides batch endpoint for all drivers'
  },
  {
    verizonConnect: 'GET /da/v1/driversafety/{drivernumber}',
    terminal: 'GET /safety/events',
    status: 'REPLACE',
    notes: 'Terminal provides unified safety event format'
  }
];

verizonConnectMapping.push(...vcMappings);

// Generate SambaSafety integration points
console.log('🔗 Generating SambaSafety integration points...');
const sambaIntegrations = [
  {
    terminalEndpoint: 'GET /drivers',
    sambasafetyEndpoint: 'POST /people/v1/people/search',
    integrationPoint: 'Match drivers by license number',
    dataFlow: 'Terminal driver → SambaSafety person lookup → MVR reports'
  },
  {
    terminalEndpoint: 'GET /drivers/{id}',
    sambasafetyEndpoint: 'GET /people/{personId}/mvr-reports',
    integrationPoint: 'Enrich driver profile with MVR data',
    dataFlow: 'Terminal driver detail → SambaSafety MVR → Merged profile'
  },
  {
    terminalEndpoint: 'GET /safety/events',
    sambasafetyEndpoint: 'GET /people/{personId}/mvr-reports',
    integrationPoint: 'Combine telematics events with MVR violations',
    dataFlow: 'Terminal safety events + SambaSafety violations → Enhanced risk score'
  }
];

sambasafetyIntegration.push(...sambaIntegrations);

// Write output files
console.log('\n💾 Writing output files...');

// 1. Complete API catalog (JSON)
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'parsed-collection.json'),
  JSON.stringify(apiCatalog, null, 2)
);
console.log('  ✅ parsed-collection.json');

// 2. Endpoint list (JSON)
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'endpoint-list.json'),
  JSON.stringify(endpointList, null, 2)
);
console.log('  ✅ endpoint-list.json');

// 3. Verizon Connect mapping (JSON)
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'verizon-connect-mapping.json'),
  JSON.stringify(verizonConnectMapping, null, 2)
);
console.log('  ✅ verizon-connect-mapping.json');

// 4. SambaSafety integration (JSON)
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'sambasafety-integration.json'),
  JSON.stringify(sambasafetyIntegration, null, 2)
);
console.log('  ✅ sambasafety-integration.json');

// 5. Human-readable summary (Markdown)
let markdown = `# Terminal API Summary\n\n`;
markdown += `**Generated**: ${new Date().toISOString()}\n`;
markdown += `**Total Categories**: ${apiCatalog.categories.length}\n`;
markdown += `**Total Endpoints**: ${endpointList.length}\n\n`;
markdown += `---\n\n`;

apiCatalog.categories.forEach(category => {
  markdown += `## ${category.name}\n\n`;
  if (category.description) {
    markdown += `${category.description}\n\n`;
  }
  markdown += `**Endpoints**: ${category.endpoints.length}\n\n`;
  
  category.endpoints.forEach(endpoint => {
    markdown += `### ${endpoint.name}\n\n`;
    markdown += `- **Method**: \`${endpoint.method}\`\n`;
    markdown += `- **Path**: \`${endpoint.path}\`\n`;
    if (endpoint.description) {
      markdown += `- **Description**: ${endpoint.description}\n`;
    }
    
    if (endpoint.parameters.query.length > 0) {
      markdown += `\n**Query Parameters**:\n`;
      endpoint.parameters.query.forEach(param => {
        markdown += `- \`${param.key}\`${param.required ? ' (required)' : ''}: ${param.description}\n`;
      });
    }
    
    if (endpoint.parameters.path.length > 0) {
      markdown += `\n**Path Parameters**:\n`;
      endpoint.parameters.path.forEach(param => {
        markdown += `- \`${param.key}\`: ${param.description}\n`;
      });
    }
    
    markdown += `\n`;
  });
  
  markdown += `---\n\n`;
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'API_SUMMARY.md'),
  markdown
);
console.log('  ✅ API_SUMMARY.md');

// Summary
console.log('\n✅ Parsing complete!');
console.log(`\n📊 Summary:`);
console.log(`  - Categories: ${apiCatalog.categories.length}`);
console.log(`  - Endpoints: ${endpointList.length}`);
console.log(`  - Verizon Connect mappings: ${verizonConnectMapping.length}`);
console.log(`  - SambaSafety integration points: ${sambasafetyIntegration.length}`);
console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
console.log(`\n🎯 Next steps:`);
console.log(`  1. Review API_SUMMARY.md for complete endpoint documentation`);
console.log(`  2. Review verizon-connect-mapping.json for migration plan`);
console.log(`  3. Review sambasafety-integration.json for integration strategy`);
console.log(`  4. Begin backend Lambda proxy implementation`);
