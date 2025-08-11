#!/usr/bin/env node

/**
 * Data validation script for FasaadGov v02
 * Validates JSON data files against the schema
 */

import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

async function validateData() {
  try {
    // Load schema
    const schemaPath = path.join(process.cwd(), 'data/schema/fasaad_schema.json');
    if (!fs.existsSync(schemaPath)) {
      console.log('⚠️  Schema file not found. Run task 2.1 to create it.');
      return;
    }
    
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schema);
    
    // Find and validate data files
    const dataFiles = [
      'companies_enhanced.json',
      // Add other data files as needed
    ];
    
    let allValid = true;
    
    for (const file of dataFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`Validating ${file}...`);
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const valid = validate(data);
        
        if (valid) {
          console.log(`✅ ${file} is valid`);
        } else {
          console.log(`❌ ${file} has validation errors:`);
          validate.errors.forEach(error => {
            console.log(`  - ${error.instancePath}: ${error.message}`);
          });
          allValid = false;
        }
      }
    }
    
    if (allValid) {
      console.log('\n🎉 All data files are valid!');
    } else {
      console.log('\n⚠️  Some data files have validation errors.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error during validation:', error.message);
    process.exit(1);
  }
}

validateData();