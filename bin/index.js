#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Reserved token that cannot be used as a project name
const PLACEHOLDER_PROJECT_NAME = 'TEMPLATE';

function validateGitUrl(url) {
  // Basic git URL validation
  const gitUrlPattern = /^(https?:\/\/|git@)([^\s]+)(\.git)?$/;
  if (!gitUrlPattern.test(url)) {
    throw new Error('Invalid repository URL format. Expected format: https://github.com/user/repo.git or git@github.com:user/repo.git');
  }
  return url;
}

function validateProjectName(name) {
  // NPM package name validation (since we're working with Node projects)
  const namePattern = /^[a-zA-Z0-9-_.]+$/;
  const startsWithPattern = /^[a-zA-Z0-9]/;
  
  if (name === '.') return name; // Allow "." for current directory
  
  // Check for placeholder pattern (text within angle brackets)
  const placeholderPattern = /^<[^>]+>$/;
  if (placeholderPattern.test(name)) {
    const placeholderText = name.slice(1, -1); // Remove the angle brackets
    throw new Error(
      `"${name}" is a placeholder. Please replace it with your actual project name.\n` +
      `Example: npx make-mine https://github.com/user/repo.git my-project-name`
    );
  }
  
  // Check for reserved token
  if (name === PLACEHOLDER_PROJECT_NAME) {
    throw new Error(`"${PLACEHOLDER_PROJECT_NAME}" is a reserved token and cannot be used as a project name`);
  }
  
  if (!namePattern.test(name)) {
    throw new Error(
      'Invalid project name. Names can only contain letters, numbers, hyphens, underscores and dots.\n' +
      'Use hyphens instead of spaces: "my-new-project" instead of "my new project"'
    );
  }
  
  if (!startsWithPattern.test(name)) {
    throw new Error('Project name must start with a letter or number');
  }
  
  if (name.length > 214) {
    throw new Error('Project name is too long (max 214 characters)');
  }
  
  return name;
}

function getTemplateNameFromRepo(repoUrl) {
  // Extract name from repo URL (e.g., "template-project" from "user/template-project.git")
  const match = repoUrl.match(/\/([^/]+?)(\.git)?$/);
  return match ? match[1] : 'template-project';
}

function updateFileContent(filePath, oldName, newName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(new RegExp(oldName, 'g'), newName);
    fs.writeFileSync(filePath, newContent);
    return content !== newContent; // return true if file was modified
  } catch (error) {
    console.log(chalk.yellow(`Skipping ${filePath}: ${error.message}`));
    return false;
  }
}

async function createProject(repoUrl, projectName) {
  try {
    // Validate inputs
    validateGitUrl(repoUrl);
    validateProjectName(projectName);

    const isCurrentDir = projectName === '.';
    const displayName = isCurrentDir ? path.basename(process.cwd()) : projectName;
    
    // Validate the display name as well when using current directory
    if (isCurrentDir) {
      validateProjectName(displayName);
    }
    
    console.log(chalk.blue(`Creating project in: ${displayName}`));

    // Create project directory only if not using current directory
    if (!isCurrentDir) {
      fs.mkdirSync(projectName);
      process.chdir(projectName);
    }

    // Clone repository
    console.log(chalk.yellow('Cloning template repository...'));
    execSync(`git clone ${repoUrl} .`, { stdio: 'inherit' });

    // Get template name from repo
    const templateName = getTemplateNameFromRepo(repoUrl);

    // Remove .git folder
    console.log(chalk.yellow('Cleaning up git history...'));
    execSync('rm -rf .git');

    // Initialize new git repository
    execSync('git init');

    // Update files in root directory
    console.log(chalk.yellow('Updating project files...'));
    const rootFiles = fs.readdirSync('.')
      .filter(file => fs.statSync(file).isFile());

    let modifiedFiles = 0;
    rootFiles.forEach(file => {
      if (updateFileContent(file, templateName, displayName)) {
        console.log(chalk.gray(`Updated ${file}`));
        modifiedFiles++;
      }
    });

    console.log(chalk.green('\n✨ Project successfully created!'));
    console.log(chalk.white(`Modified ${modifiedFiles} files`));
    
    // Add warning about potential manual renaming needed
    console.log(chalk.yellow('\nNote: Some files might still contain the original template name.'));
    console.log(chalk.yellow(`You may need to manually search for and replace any remaining instances of:`));
    console.log(chalk.white(`  - "${templateName}"`));
    
    console.log(chalk.white(`\nNext steps:`));
    if (!isCurrentDir) {
      console.log(chalk.white(`  1. cd ${displayName}`));
    }
    console.log(chalk.white(`  2. Review the updated files`));
    console.log(chalk.white(`  3. Search for any remaining instances of "${templateName}"`));
    console.log(chalk.white(`  4. Follow project-specific setup instructions in README.md`));

  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

// Export functions for testing
if (require.main === module) {
  // Only run the CLI if this file is being run directly
  program
    .name('make-mine')
    .description('CLI to create new projects from a template repository')
    .version('1.0.0')
    .argument('<repo-url>', 'Git repository URL to clone from (e.g., https://github.com/user/repo.git)')
    .argument('<project-name>', 'New name for your project (e.g., my-awesome-app, use hyphens instead of spaces)')
    .usage('<repo-url> <project-name>')
    .addHelpText('after', `
Examples:
  $ make-mine https://github.com/user/repo.git my-new-project
  $ make-mine https://github.com/bladnman/vite-react-ts-mui-zustand.git my-cool-app
  $ mkdir my-app && cd my-app && make-mine https://github.com/user/repo.git .`)
    .on('--help', () => {
      console.log('\nNOTE: If your project name contains spaces, wrap it in quotes:');
      console.log('  $ make-mine repo-url "my project name"');
    });

  // Check for extra arguments before parsing
  const args = process.argv.slice(2);
  if (args.length > 2) {
    console.error(chalk.red('Error: Too many arguments provided.'));
    console.error(chalk.yellow('\nUse hyphens instead of spaces in your project name:'));
    console.error(chalk.white('  $ make-mine repo-url my-project-name'));
    console.error(chalk.white(`\nReceived arguments: ${args.join(', ')}`));
    process.exit(1);
  }

  // Show help if no arguments provided
  if (args.length === 0) {
    program.help();
  }

  program
    .action((repoUrl, projectName) => {
      if (!repoUrl || !projectName) {
        console.error(chalk.red('Error: Both repository URL and project name are required'));
        program.help();
        process.exit(1);
      }
      createProject(repoUrl, projectName);
    });

  program.parse();
} else {
  // Export functions for testing
  module.exports = {
    validateGitUrl,
    validateProjectName,
    getTemplateNameFromRepo,
    updateFileContent,
    createProject
  };
} 