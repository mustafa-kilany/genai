const Law = require('../models/Law');
const Case = require('../models/Case');
const fs = require('fs').promises;
const path = require('path');

/**
 * Agent Tools - Modular tool functions for the legal assistant agent
 */

/**
 * Search tool - Search laws in the knowledge base
 */
async function searchLaws(query, limit = 5) {
  try {
    const laws = await Law.find({
      $or: [
        { content_en: new RegExp(query, 'i') },
        { content_ar: new RegExp(query, 'i') },
        { title_en: new RegExp(query, 'i') },
        { title_ar: new RegExp(query, 'i') }
      ]
    })
      .sort({ article_num: 1 })
      .limit(limit);
    
    return {
      success: true,
      results: laws.map(law => ({
        article: law.article,
        article_num: law.article_num,
        title_en: law.title_en,
        title_ar: law.title_ar,
        content_en: law.content_en,
        content_ar: law.content_ar
      })),
      count: laws.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculator tool - Perform legal calculations (fines, penalties, etc.)
 */
function calculate(expression) {
  try {
    // Sanitize expression to only allow safe math operations
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    const result = Function(`"use strict"; return (${sanitized})`)();
    
    return {
      success: true,
      expression: sanitized,
      result: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * File reader tool - Read FAQ or knowledge base files
 */
async function readFile(filePath) {
  try {
    // Security: Only allow reading from specific directories
    const allowedDirs = ['faqs', 'knowledge-base'];
    
    // Normalize file path
    let normalizedPath = filePath;
    if (!normalizedPath.startsWith('./') && !normalizedPath.startsWith('../')) {
      normalizedPath = './' + normalizedPath;
    }
    
    const resolvedPath = path.resolve(__dirname, '..', normalizedPath);
    const baseDir = path.resolve(__dirname, '..');
    
    // Ensure path is within allowed directories
    if (!resolvedPath.startsWith(baseDir)) {
      return {
        success: false,
        error: 'Access denied: File path not allowed'
      };
    }
    
    // Check if path contains allowed directory
    const isAllowed = allowedDirs.some(dir => 
      resolvedPath.includes(path.join(baseDir, dir))
    );
    
    if (!isAllowed) {
      return {
        success: false,
        error: 'Access denied: File must be in faqs/ or knowledge-base/ directory'
      };
    }
    
    const content = await fs.readFile(resolvedPath, 'utf-8');
    return {
      success: true,
      content: content,
      filePath: filePath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Case lookup tool - Search for similar cases
 */
async function searchCases(query) {
  try {
    const cases = await Case.find({
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') }
      ]
    }).limit(5);
    
    return {
      success: true,
      results: cases.map(c => ({
        title: c.title,
        description: c.description,
        relatedArticles: c.relatedArticles
      })),
      count: cases.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool registry - Maps tool names to functions
 */
const tools = {
  search_laws: {
    name: 'search_laws',
    description: 'Search for laws and legal articles in the knowledge base. Use this when the user asks about specific laws, articles, or legal provisions.',
    function: searchLaws,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for laws'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 5)'
        }
      },
      required: ['query']
    }
  },
  calculate: {
    name: 'calculate',
    description: 'Perform mathematical calculations. Use this for calculating fines, penalties, interest, or any numerical computations related to legal matters.',
    function: calculate,
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate'
        }
      },
      required: ['expression']
    }
  },
  read_file: {
    name: 'read_file',
    description: 'Read content from FAQ files or knowledge base documents. Use this when the user asks about frequently asked questions or needs information from stored documents.',
    function: readFile,
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the file to read (must be in faqs/ or knowledge-base/ directory)'
        }
      },
      required: ['filePath']
    }
  },
  search_cases: {
    name: 'search_cases',
    description: 'Search for legal cases and precedents. Use this when the user asks about similar cases, legal precedents, or case studies.',
    function: searchCases,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for cases'
        }
      },
      required: ['query']
    }
  }
};

/**
 * Execute a tool call
 */
async function executeTool(toolName, parameters) {
  const tool = tools[toolName];
  if (!tool) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`
    };
  }
  
  try {
    const result = await tool.function(...Object.values(parameters));
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get tools schema for OpenAI function calling
 */
function getToolsSchema() {
  return Object.values(tools).map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
}

module.exports = {
  tools,
  executeTool,
  getToolsSchema,
  searchLaws,
  calculate,
  readFile,
  searchCases
};

