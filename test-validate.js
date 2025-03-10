const { validateProjectName } = require('./bin/index.js');

// Test cases
const testCases = [
  {
    name: '<mcp-server>',
    description: 'Should detect placeholder pattern',
    expectError: true,
    errorMessage: 'is a placeholder'
  },
  {
    name: 'my-project',
    description: 'Should pass valid project name',
    expectError: false
  },
  {
    name: 'TEMPLATE',
    description: 'Should detect reserved token',
    expectError: true,
    errorMessage: 'is a reserved token'
  },
  {
    name: '.',
    description: 'Should allow current directory',
    expectError: false
  },
  {
    name: '123project',
    description: 'Should allow project name starting with number',
    expectError: false
  },
  {
    name: 'my project',
    description: 'Should reject project name with spaces',
    expectError: true,
    errorMessage: 'Invalid project name'
  },
  {
    name: '<project-name>',
    description: 'Should detect another placeholder pattern',
    expectError: true,
    errorMessage: 'is a placeholder'
  }
];

console.log('Running validation tests...\n');

testCases.forEach(({ name, description, expectError, errorMessage }) => {
  console.log(`Testing: ${description}`);
  console.log(`Input: "${name}"`);
  try {
    const result = validateProjectName(name);
    if (expectError) {
      console.log('❌ FAILED: Expected an error but got:', result);
    } else {
      console.log('✅ PASSED:', result);
    }
  } catch (error) {
    if (expectError) {
      if (errorMessage && error.message.includes(errorMessage)) {
        console.log('✅ PASSED:', error.message);
      } else {
        console.log('❌ FAILED: Got error but with unexpected message:', error.message);
      }
    } else {
      console.log('❌ FAILED:', error.message);
    }
  }
  console.log('---\n');
}); 