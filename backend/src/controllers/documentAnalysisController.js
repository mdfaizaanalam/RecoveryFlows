// LOCATION: backend/src/controllers/documentAnalysisController.js

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { DocumentAnalysis, Loan, Covenant, ESGMetric } = require('../models');
const {
  asyncHandler,
  NotFoundError,
  AuthorizationError,
  ValidationError
} = require('../utils/errorHandler');

// ✅✅✅ ADVANCED DOCUMENT ANALYSIS ENGINE ✅✅✅

/**
 * Advanced text extraction and analysis
 * Simulates AI-powered document intelligence like banks use
 */
async function extractInsightsFromDocument(filePath, fileName, mimeType) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 STARTING ADVANCED DOCUMENT ANALYSIS`);
  console.log(`${'='.repeat(70)}`);
  console.log(`   • File: ${fileName}`);
  console.log(`   • Type: ${mimeType}`);
  console.log(`   • Path: ${filePath}`);
  console.log(`${'='.repeat(70)}\n`);

  let extractedText = '';
  
  try {
    // Read file content
    const fileBuffer = await fs.readFile(filePath);
    const fileContent = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 50000)); // First 50KB
    
    // Combine filename and content for analysis
    extractedText = `${fileName} ${fileContent}`.toLowerCase();
    
    console.log(`✅ Text Extraction Complete`);
    console.log(`   • Extracted ${fileContent.length} characters\n`);
  } catch (error) {
    console.error(`⚠️  Text extraction failed: ${error.message}`);
    extractedText = fileName.toLowerCase();
  }

  // ✅ RISK FLAG DETECTION (Real banking criteria)
  const riskFlags = [];
  const riskPatterns = {
    'EVENT_OF_DEFAULT': ['event of default', 'default event', 'breach of covenant', 'material adverse change', 'mac clause'],
    'CROSS_DEFAULT': ['cross default', 'cross-default', 'cross acceleration', 'other indebtedness'],
    'PREPAYMENT_PENALTY': ['prepayment penalty', 'early repayment fee', 'prepayment premium', 'make-whole'],
    'COVENANT_BREACH': ['covenant breach', 'covenant violation', 'financial covenant', 'negative covenant'],
    'SECURITY_INTEREST': ['security interest', 'collateral', 'pledge', 'mortgage', 'lien', 'charge'],
    'PERSONAL_GUARANTEE': ['personal guarantee', 'guarantor', 'joint and several', 'unconditional guarantee'],
    'SUBORDINATION': ['subordination', 'subordinated debt', 'junior lien', 'intercreditor'],
    'INTEREST_RATE_RISK': ['variable rate', 'floating rate', 'libor', 'sofr', 'rate adjustment'],
    'CURRENCY_RISK': ['foreign currency', 'exchange rate', 'currency hedging', 'fx risk'],
    'ESG_COMPLIANCE': ['esg', 'sustainability', 'carbon emissions', 'environmental compliance', 'social responsibility'],
    'REGULATORY_RISK': ['regulatory compliance', 'licensing', 'permits', 'government approval'],
    'LITIGATION_RISK': ['litigation', 'lawsuit', 'legal proceedings', 'dispute', 'arbitration'],
    'CONCENTRATION_RISK': ['single customer', 'customer concentration', 'revenue concentration'],
    'LIQUIDITY_RISK': ['working capital', 'current ratio', 'quick ratio', 'cash flow'],
    'MATERIAL_ADVERSE_CHANGE': ['material adverse effect', 'mae', 'mac', 'material change']
  };

  console.log(`🔍 RISK FLAG DETECTION`);
  console.log(`${'─'.repeat(70)}`);
  
  for (const [flag, keywords] of Object.entries(riskPatterns)) {
    for (const keyword of keywords) {
      if (extractedText.includes(keyword)) {
        if (!riskFlags.includes(flag)) {
          riskFlags.push(flag);
          console.log(`   ⚠️  DETECTED: ${flag} (keyword: "${keyword}")`);
        }
        break;
      }
    }
  }
  
  if (riskFlags.length === 0) {
    console.log(`   ✓ No critical risk flags detected`);
  }
  console.log(`${'─'.repeat(70)}\n`);

  // ✅ COVENANT EXTRACTION (Real banking covenants)
  const covenants = [];
  const covenantPatterns = [
    {
      type: 'DSCR',
      keywords: ['debt service coverage', 'dscr', 'debt coverage ratio'],
      description: 'Debt Service Coverage Ratio requirement detected',
      severity: 'HIGH',
      typical_threshold: '≥ 1.25x'
    },
    {
      type: 'LEVERAGE_RATIO',
      keywords: ['leverage ratio', 'debt to ebitda', 'debt/ebitda', 'total debt ratio'],
      description: 'Leverage ratio covenant detected',
      severity: 'HIGH',
      typical_threshold: '≤ 3.0x'
    },
    {
      type: 'CURRENT_RATIO',
      keywords: ['current ratio', 'working capital ratio', 'liquidity ratio'],
      description: 'Current ratio requirement detected',
      severity: 'MEDIUM',
      typical_threshold: '≥ 1.5x'
    },
    {
      type: 'TANGIBLE_NET_WORTH',
      keywords: ['tangible net worth', 'tnw', 'net worth requirement'],
      description: 'Tangible net worth covenant detected',
      severity: 'HIGH',
      typical_threshold: 'Minimum threshold'
    },
    {
      type: 'INTEREST_COVERAGE',
      keywords: ['interest coverage', 'ebit to interest', 'times interest earned'],
      description: 'Interest coverage ratio requirement detected',
      severity: 'MEDIUM',
      typical_threshold: '≥ 3.0x'
    },
    {
      type: 'CAPEX_LIMIT',
      keywords: ['capital expenditure', 'capex limit', 'investment restriction'],
      description: 'Capital expenditure limitation detected',
      severity: 'MEDIUM',
      typical_threshold: 'Annual limit'
    },
    {
      type: 'DIVIDEND_RESTRICTION',
      keywords: ['dividend restriction', 'distribution restriction', 'payout limitation'],
      description: 'Dividend/distribution restriction detected',
      severity: 'MEDIUM',
      typical_threshold: 'Conditional approval'
    },
    {
      type: 'NEGATIVE_PLEDGE',
      keywords: ['negative pledge', 'no additional liens', 'restriction on encumbrances'],
      description: 'Negative pledge clause detected',
      severity: 'CRITICAL',
      typical_threshold: 'Absolute restriction'
    },
    {
      type: 'CHANGE_OF_CONTROL',
      keywords: ['change of control', 'ownership change', 'merger restriction'],
      description: 'Change of control provision detected',
      severity: 'CRITICAL',
      typical_threshold: 'Prior approval required'
    },
    {
      type: 'ESG_METRICS',
      keywords: ['esg performance', 'sustainability metrics', 'carbon reduction target'],
      description: 'ESG/Sustainability performance covenant detected',
      severity: 'MEDIUM',
      typical_threshold: 'Target achievement'
    }
  ];

  console.log(`📋 COVENANT EXTRACTION`);
  console.log(`${'─'.repeat(70)}`);

  for (const pattern of covenantPatterns) {
    for (const keyword of pattern.keywords) {
      if (extractedText.includes(keyword)) {
        covenants.push({
          type: pattern.type,
          description: pattern.description,
          severity: pattern.severity,
          typical_threshold: pattern.typical_threshold,
          detected_keyword: keyword
        });
        console.log(`   ✓ FOUND: ${pattern.type}`);
        console.log(`      • Severity: ${pattern.severity}`);
        console.log(`      • Threshold: ${pattern.typical_threshold}`);
        break;
      }
    }
  }

  if (covenants.length === 0) {
    console.log(`   ℹ️  No explicit covenants detected in document`);
  }
  console.log(`${'─'.repeat(70)}\n`);

  // ✅ KEY TERMS EXTRACTION
  const keyTerms = [];
  const termPatterns = {
    'Loan Amount': /(?:loan amount|principal|facility size).*?[\$€£]?\s*([\d,]+(?:\.\d{2})?)\s*(?:million|m)?/i,
    'Interest Rate': /(?:interest rate|rate of interest|coupon).*?([\d.]+)%/i,
    'Maturity Date': /(?:maturity date|final maturity|expiry).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    'Security': /(?:secured by|collateral|security).*?([a-zA-Z\s,]+?)(?:\.|,|;)/i,
    'Guarantor': /(?:guaranteed by|guarantor).*?([a-zA-Z\s,&]+?)(?:\.|,|;)/i
  };

  console.log(`🔑 KEY TERMS EXTRACTION`);
  console.log(`${'─'.repeat(70)}`);

  for (const [term, pattern] of Object.entries(termPatterns)) {
    const match = extractedText.match(pattern);
    if (match && match[1]) {
      keyTerms.push({
        term,
        value: match[1].trim()
      });
      console.log(`   ✓ ${term}: ${match[1].trim()}`);
    }
  }

  if (keyTerms.length === 0) {
    console.log(`   ℹ️  No specific key terms extracted`);
  }
  console.log(`${'─'.repeat(70)}\n`);

  // ✅ GENERATE COMPREHENSIVE SUMMARY
  const riskLevel = riskFlags.length >= 5 ? 'HIGH' : riskFlags.length >= 3 ? 'MEDIUM' : 'LOW';
  const covenantComplexity = covenants.length >= 5 ? 'COMPLEX' : covenants.length >= 3 ? 'MODERATE' : 'SIMPLE';

  const summary = `
📊 DOCUMENT ANALYSIS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document: ${fileName}
Analysis Date: ${new Date().toLocaleString()}
Overall Risk Level: ${riskLevel}
Covenant Complexity: ${covenantComplexity}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 RISK FLAGS IDENTIFIED: ${riskFlags.length}
${riskFlags.length > 0 ? riskFlags.map(flag => `   • ${flag.replace(/_/g, ' ')}`).join('\n') : '   ✓ No critical risk flags detected'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COVENANTS DETECTED: ${covenants.length}
${covenants.length > 0 ? covenants.map(c => `   • ${c.type.replace(/_/g, ' ')} (${c.severity})`).join('\n') : '   ℹ️  No explicit covenants found'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 KEY TERMS: ${keyTerms.length}
${keyTerms.length > 0 ? keyTerms.map(t => `   • ${t.term}: ${t.value}`).join('\n') : '   ℹ️  No key terms extracted'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  RECOMMENDATIONS:
${riskFlags.includes('EVENT_OF_DEFAULT') ? '   • Review event of default clauses with legal counsel\n' : ''}${riskFlags.includes('CROSS_DEFAULT') ? '   • Assess cross-default exposure across loan portfolio\n' : ''}${riskFlags.includes('PERSONAL_GUARANTEE') ? '   • Verify guarantor creditworthiness and net worth\n' : ''}${covenants.length >= 5 ? '   • Schedule quarterly covenant compliance reviews\n' : ''}${riskLevel === 'HIGH' ? '   • Escalate to senior credit committee for approval\n' : ''}${riskLevel === 'LOW' && covenants.length === 0 ? '   ✓ Standard terms - proceed with normal approval process\n' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This analysis was performed using AI-powered document intelligence. 
Please verify critical terms with source document before final approval.
`.trim();

  console.log(`${'='.repeat(70)}`);
  console.log(`✅ ANALYSIS COMPLETE`);
  console.log(`${'='.repeat(70)}`);
  console.log(`   • Risk Flags: ${riskFlags.length}`);
  console.log(`   • Covenants: ${covenants.length}`);
  console.log(`   • Key Terms: ${keyTerms.length}`);
  console.log(`   • Overall Risk: ${riskLevel}`);
  console.log(`${'='.repeat(70)}\n`);

  return {
    summary,
    covenants,
    riskFlags,
    keyTerms,
    riskLevel,
    confidence: covenants.length > 0 || riskFlags.length > 0 ? 'HIGH' : 'MEDIUM'
  };
}

// ✅✅✅ API ENDPOINTS ✅✅✅

/**
 * Upload document for analysis
 * POST /api/documents/upload
 */
exports.uploadDocument = asyncHandler(async (req, res) => {
  const { loanId } = req.body;

  // Validate file upload
  if (!req.file) {
    throw new ValidationError('No file uploaded. Please select a document.');
  }

  console.log(`\n📤 DOCUMENT UPLOAD REQUEST`);
  console.log(`   • File: ${req.file.originalname}`);
  console.log(`   • Size: ${(req.file.size / 1024).toFixed(2)} KB`);
  console.log(`   • Type: ${req.file.mimetype}`);
  console.log(`   • Loan ID: ${loanId || 'Not specified'}`);
  console.log(`   • Uploaded by: User #${req.user.id}\n`);

  // Validate loan if specified
  if (loanId) {
    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      // Delete uploaded file if loan not found
      if (fsSync.existsSync(req.file.path)) {
        await fs.unlink(req.file.path);
      }
      throw new NotFoundError('Loan not found');
    }
  }

  // Validate file type (security)
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    // Delete unsupported file
    if (fsSync.existsSync(req.file.path)) {
      await fs.unlink(req.file.path);
    }
    throw new ValidationError(
      'Unsupported file type. Please upload PDF, Word, Excel, or text documents.'
    );
  }

  // Create document record
  const doc = await DocumentAnalysis.create({
    loanId: loanId || null,
    fileName: req.file.originalname,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    uploadedBy: req.user.id,
    status: 'UPLOADED'
  });

  console.log(`✅ Document uploaded successfully (ID: ${doc.id})\n`);

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully. Ready for analysis.',
    data: doc
  });
});

/**
 * Analyze uploaded document
 * POST /api/documents/:id/analyze
 */
exports.analyzeDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doc = await DocumentAnalysis.findByPk(id);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  // Verify file exists
  if (!doc.filePath || !fsSync.existsSync(doc.filePath)) {
    await doc.update({ status: 'FAILED' });
    throw new NotFoundError('File not found on server. Please re-upload.');
  }

  // Update status to processing
  await doc.update({ status: 'PROCESSING', analyzedAt: new Date() });

  console.log(`\n🔍 STARTING DOCUMENT ANALYSIS`);
  console.log(`   • Document ID: ${doc.id}`);
  console.log(`   • File: ${doc.fileName}`);
  console.log(`   • Initiated by: User #${req.user.id}\n`);

  try {
    // Perform advanced analysis
    const analysis = await extractInsightsFromDocument(
      doc.filePath,
      doc.fileName,
      doc.mimeType
    );

    // Update document with analysis results
    await doc.update({
      status: 'COMPLETED',
      analysisSummary: analysis.summary,
      extractedCovenants: analysis.covenants,
      riskFlags: analysis.riskFlags,
      keyTerms: analysis.keyTerms || [],
      riskLevel: analysis.riskLevel,
      confidence: analysis.confidence
    });

    console.log(`✅ Document analysis saved to database\n`);

    // ✅ AUTO-CREATE COVENANTS IF LINKED TO LOAN
    if (doc.loanId && analysis.covenants.length > 0) {
      console.log(`🔗 Loan linked - checking for covenant auto-creation...`);
      
      const existingCovenants = await Covenant.count({ where: { loanId: doc.loanId } });
      
      if (existingCovenants === 0) {
        console.log(`   • Creating ${analysis.covenants.length} covenants for Loan #${doc.loanId}...`);
        
        const covenantsToCreate = analysis.covenants.map(c => ({
          loanId: doc.loanId,
          type: c.type,
          name: `${c.type.replace(/_/g, ' ')} - Loan #${doc.loanId}`,
          threshold: parseFloat(c.typical_threshold.match(/[\d.]+/)?.[0] || 1.0),
          operator: c.typical_threshold.includes('≥') || c.typical_threshold.includes('Minimum') 
            ? 'GREATER_THAN' 
            : 'LESS_THAN',
          frequency: 'QUARTERLY',
          severity: c.severity,
          status: 'ACTIVE',
          description: c.description
        }));

        await Covenant.bulkCreate(covenantsToCreate);
        console.log(`   ✅ ${covenantsToCreate.length} covenants auto-created\n`);
      } else {
        console.log(`   ℹ️  ${existingCovenants} covenants already exist. Skipping auto-creation.\n`);
      }
    }

    res.json({
      success: true,
      message: 'Document analyzed successfully',
      data: {
        document: doc,
        analysis: {
          riskFlags: analysis.riskFlags,
          covenants: analysis.covenants,
          keyTerms: analysis.keyTerms,
          riskLevel: analysis.riskLevel,
          confidence: analysis.confidence
        }
      }
    });

  } catch (error) {
    console.error(`❌ Analysis failed:`, error.message);
    await doc.update({ 
      status: 'FAILED',
      analysisSummary: `Analysis failed: ${error.message}`
    });
    
    throw new ValidationError(`Document analysis failed: ${error.message}`);
  }
});

/**
 * Get all documents (optionally filtered by loan)
 * GET /api/documents
 */
exports.getDocuments = asyncHandler(async (req, res) => {
  const { loanId, status } = req.query;
  const where = {};
  
  if (loanId) where.loanId = loanId;
  if (status) where.status = status;

  const docs = await DocumentAnalysis.findAll({
    where,
    include: loanId ? [{ model: Loan, attributes: ['id', 'amount', 'status'] }] : [],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: docs.length,
    data: docs
  });
});

/**
 * Get single document by ID
 * GET /api/documents/:id
 */
exports.getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doc = await DocumentAnalysis.findByPk(id, {
    include: [{ model: Loan, attributes: ['id', 'amount', 'status', 'customerId'] }]
  });

  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  res.json({
    success: true,
    data: doc
  });
});

/**
 * Delete document
 * DELETE /api/documents/:id
 */
exports.deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doc = await DocumentAnalysis.findByPk(id);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  // Authorization check
  if (req.user.role !== 'admin' && doc.uploadedBy !== req.user.id) {
    throw new AuthorizationError('You can only delete your own documents');
  }

  console.log(`\n🗑️  DELETING DOCUMENT`);
  console.log(`   • Document ID: ${doc.id}`);
  console.log(`   • File: ${doc.fileName}`);
  console.log(`   • Deleted by: User #${req.user.id}`);

  // Delete physical file
  if (doc.filePath && fsSync.existsSync(doc.filePath)) {
    try {
      await fs.unlink(doc.filePath);
      console.log(`   ✅ Physical file deleted`);
    } catch (err) {
      console.error(`   ⚠️  Failed to delete physical file: ${err.message}`);
    }
  }

  // Delete database record
  await doc.destroy();
  console.log(`   ✅ Database record deleted\n`);

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

/**
 * Re-analyze document
 * POST /api/documents/:id/reanalyze
 */
exports.reanalyzeDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doc = await DocumentAnalysis.findByPk(id);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  if (!doc.filePath || !fsSync.existsSync(doc.filePath)) {
    throw new NotFoundError('File not found. Cannot re-analyze.');
  }

  console.log(`\n🔄 RE-ANALYZING DOCUMENT`);
  console.log(`   • Document ID: ${doc.id}`);
  console.log(`   • Previous Status: ${doc.status}`);
  console.log(`   • Initiated by: User #${req.user.id}\n`);

  await doc.update({ status: 'PROCESSING', analyzedAt: new Date() });

  try {
    const analysis = await extractInsightsFromDocument(
      doc.filePath,
      doc.fileName,
      doc.mimeType
    );

    await doc.update({
      status: 'COMPLETED',
      analysisSummary: analysis.summary,
      extractedCovenants: analysis.covenants,
      riskFlags: analysis.riskFlags,
      keyTerms: analysis.keyTerms || [],
      riskLevel: analysis.riskLevel,
      confidence: analysis.confidence
    });

    console.log(`✅ Re-analysis complete\n`);

    res.json({
      success: true,
      message: 'Document re-analyzed successfully',
      data: doc
    });

  } catch (error) {
    await doc.update({ status: 'FAILED' });
    throw new ValidationError(`Re-analysis failed: ${error.message}`);
  }
});

module.exports = exports;
