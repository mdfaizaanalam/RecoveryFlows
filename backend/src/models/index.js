// LOCATION: backend/src/models/index.js

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// ✅ BEST: Auto-detect production (Neon) or local (PgAdmin)
const sequelize = process.env.DATABASE_URL
  ? // PRODUCTION: Neon/Heroku/Railway (uses DATABASE_URL)
  new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Neon
      },
    },
    logging: false,
    pool: {
      max: 10,        // Max connections
      min: 2,         // Min connections
      acquire: 30000, // Max time to get connection (30s)
      idle: 10000,    // Max idle time before releasing (10s)
    },
  })
  : // DEVELOPMENT: Local PgAdmin (uses individual credentials)
  new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      port: process.env.DB_PORT || 5432,
      logging: false, // Set to console.log to debug SQL queries
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

// ✅ Log which mode is active
console.log(`🔗 Database Mode: ${process.env.DATABASE_URL ? '☁️ PRODUCTION (Neon/Cloud)' : '💻 DEVELOPMENT (Local PgAdmin)'}`);

// ✅ Test connection on startup
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connected successfully!');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Exit if DB connection fails
  });

module.exports = sequelize;

// ========== EXISTING MODELS (UNCHANGED) ==========

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

const Agent = sequelize.define('Agent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
});

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  interestRate: { type: DataTypes.FLOAT, allowNull: false },
  termMonths: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'closed', 'defaulted'), defaultValue: 'pending' },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  agentId: { type: DataTypes.INTEGER, allowNull: true },
  emiSchedule: { type: DataTypes.JSONB, allowNull: true },
  recoveryStatus: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
});

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  paymentDate: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  // ✅ ADD THIS
  emiNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Which EMI installment this payment is for (1, 2, 3, etc.)'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['loanId'] },
    { fields: ['loanId', 'emiNumber'] }
  ]
});


const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'agent', 'customer'), allowNull: false },
}, {
  timestamps: true,
});

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'info' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  metadata: { type: DataTypes.JSONB }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] }
  ]
});

// ========== NEW MODELS (ADDED DIRECTLY HERE) ==========

const Covenant = sequelize.define('Covenant', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  loanId: { type: DataTypes.INTEGER, allowNull: false },
  type: {
    type: DataTypes.ENUM('DSCR', 'LEVERAGE', 'PAYMENT_DELAY', 'ESG_SCORE', 'CUSTOM'),
    allowNull: false
  },
  name: { type: DataTypes.STRING, allowNull: false },
  threshold: { type: DataTypes.FLOAT, allowNull: false },
  operator: {
    type: DataTypes.ENUM('GREATER_THAN', 'LESS_THAN', 'EQUALS', 'NOT_EQUALS'),
    defaultValue: 'GREATER_THAN'
  },
  frequency: {
    type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'),
    defaultValue: 'MONTHLY'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'BREACHED', 'WAIVED', 'INACTIVE'),
    defaultValue: 'ACTIVE'
  },
  lastChecked: { type: DataTypes.DATE },
  breachDate: { type: DataTypes.DATE },
  breachValue: { type: DataTypes.FLOAT },
  description: { type: DataTypes.TEXT },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    defaultValue: 'MEDIUM'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['loanId'] },
    { fields: ['status'] },
    { fields: ['type'] }
  ]
});

const CovenantAudit = sequelize.define('CovenantAudit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  covenantId: { type: DataTypes.INTEGER, allowNull: false },
  checkDate: { type: DataTypes.DATE, allowNull: false },
  actualValue: { type: DataTypes.FLOAT },
  passed: { type: DataTypes.BOOLEAN, allowNull: false },
  notes: { type: DataTypes.TEXT }
}, {
  timestamps: true,
  indexes: [
    { fields: ['covenantId'] },
    { fields: ['checkDate'] }
  ]
});

const RecoveryTask = sequelize.define('RecoveryTask', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  loanId: { type: DataTypes.INTEGER, allowNull: false },
  assignedTo: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  taskType: {
    type: DataTypes.ENUM('REMINDER', 'RESTRUCTURE', 'LEGAL', 'NEGOTIATION', 'COVENANT_BREACH', 'INITIAL_CONTACT', 'PAYMENT_REMINDER', 'FOLLOWUP', 'RECOVERY', 'EMI_TRACKING'), // ✅ Added EMI_TRACKING
    allowNull: false
  },
  dueDate: { type: DataTypes.DATE },
  completedDate: { type: DataTypes.DATE },
  playbookId: { type: DataTypes.STRING },
  aiSuggestions: { type: DataTypes.JSONB },
  actionsTaken: { type: DataTypes.JSONB },
  outcome: { type: DataTypes.TEXT },
  // ✅✅✅ CRITICAL: ADD THIS FIELD ✅✅✅
  emiMonth: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'EMI number this task tracks (1, 2, 3, etc.)'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['loanId'] },
    { fields: ['assignedTo'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['loanId', 'emiMonth'] } // ✅ Added compound index
  ]
});


// ✅✅✅ ENHANCED LOANPARTICIPANT MODEL (MERGED FROM BOTH VERSIONS) ✅✅✅
const LoanParticipant = sequelize.define('LoanParticipant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  loanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Loans',
      key: 'id'
    }
  },
  // Support both naming conventions
  lenderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  participantName: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('lenderName');
    },
    set(value) {
      this.setDataValue('lenderName', value);
    }
  },
  participationAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  shareAmount: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('participationAmount');
    },
    set(value) {
      this.setDataValue('participationAmount', value);
    }
  },
  participationPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  sharePercentage: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('participationPercentage');
    },
    set(value) {
      this.setDataValue('participationPercentage', value);
    }
  },
  role: {
    type: DataTypes.ENUM('lead', 'participant', 'agent', 'LEAD_ARRANGER', 'PARTICIPANT', 'AGENT', 'LENDER'),
    defaultValue: 'participant'
  },
  participantType: {
    type: DataTypes.VIRTUAL,
    get() {
      const role = this.getDataValue('role');
      if (role === 'lead' || role === 'LEAD_ARRANGER') return 'LENDER';
      if (role === 'participant' || role === 'PARTICIPANT') return 'LENDER';
      return 'LENDER';
    }
  },
  recoveredAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'LoanParticipants',
  timestamps: true,
  indexes: [
    { fields: ['loanId'] },
    { fields: ['lenderName'] }
  ]
});

const ESGMetric = sequelize.define('ESGMetric', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  loanId: { type: DataTypes.INTEGER, allowNull: false },
  esgScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  carbonIntensity: { type: DataTypes.FLOAT },
  sustainabilityKPI: { type: DataTypes.STRING },
  kpiTarget: { type: DataTypes.FLOAT },
  kpiCurrent: { type: DataTypes.FLOAT },
  kpiStatus: {
    type: DataTypes.ENUM('ON_TRACK', 'AT_RISK', 'BREACHED'),
    defaultValue: 'ON_TRACK'
  },
  marginAdjustment: { type: DataTypes.FLOAT, defaultValue: 0 },
  reportingPeriod: { type: DataTypes.STRING },
  lastReportDate: { type: DataTypes.DATE },
  greenLoanClassification: { type: DataTypes.BOOLEAN, defaultValue: false },
  certificationBody: { type: DataTypes.STRING },
  certificationDate: { type: DataTypes.DATE }
}, {
  timestamps: true,
  indexes: [
    { fields: ['loanId'] },
    { fields: ['kpiStatus'] }
  ]
});

const DocumentAnalysis = sequelize.define('DocumentAnalysis', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  loanId: { type: DataTypes.INTEGER, allowNull: true },
  fileName: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false },
  mimeType: { type: DataTypes.STRING, allowNull: true },
  sizeBytes: { type: DataTypes.INTEGER, allowNull: true },
  uploadedBy: { type: DataTypes.INTEGER, allowNull: true },
  documentType: { type: DataTypes.STRING, allowNull: true },
  extractedData: { type: DataTypes.JSONB },
  analysisSummary: { type: DataTypes.TEXT },
  extractedCovenants: { type: DataTypes.JSONB },
  riskFlags: { type: DataTypes.JSONB },
  confidence: { type: DataTypes.FLOAT },
  status: {
    type: DataTypes.ENUM('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'),
    defaultValue: 'UPLOADED'
  },
  errorMessage: { type: DataTypes.TEXT }
}, {
  timestamps: true,
  indexes: [
    { fields: ['loanId'] },
    { fields: ['uploadedBy'] },
    { fields: ['status'] }
  ]
});

// ========== ASSOCIATIONS (EXISTING + NEW) ==========

// Existing associations (UNCHANGED)
Loan.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Loan, { foreignKey: 'customerId' });

Loan.belongsTo(Agent, { foreignKey: 'agentId' });
Agent.hasMany(Loan, { foreignKey: 'agentId' });

Payment.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(Payment, { foreignKey: 'loanId' });

// User associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// New associations
Covenant.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(Covenant, { foreignKey: 'loanId' });

CovenantAudit.belongsTo(Covenant, { foreignKey: 'covenantId' });
Covenant.hasMany(CovenantAudit, { foreignKey: 'covenantId' });

RecoveryTask.belongsTo(Loan, { foreignKey: 'loanId' });
RecoveryTask.belongsTo(User, { foreignKey: 'assignedTo', as: 'Assignee' });
Loan.hasMany(RecoveryTask, { foreignKey: 'loanId' });

// ✅ LoanParticipant associations
LoanParticipant.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(LoanParticipant, { foreignKey: 'loanId' });

ESGMetric.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasOne(ESGMetric, { foreignKey: 'loanId' });

DocumentAnalysis.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(DocumentAnalysis, { foreignKey: 'loanId' });

// ========== EXPORTS ==========

module.exports = {
  sequelize,
  Customer,
  Agent,
  Loan,
  Payment,
  User,
  Notification,
  Covenant,
  CovenantAudit,
  RecoveryTask,
  LoanParticipant,
  ESGMetric,
  DocumentAnalysis
};
