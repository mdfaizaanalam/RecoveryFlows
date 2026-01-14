const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Loan = require('./Loan');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  paymentDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
  
  // 🟢 ADD THIS SECTION TO STOP COLUMN DELETION
  emiNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Which EMI installment this payment is for (1, 2, 3, etc.)'
  }
}, {
  timestamps: true,
  // 🟢 OPTIONAL: Match the indexes from index.js for performance
  indexes: [
    { fields: ['loanId'] },
    { fields: ['loanId', 'emiNumber'] }
  ]
});

Payment.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(Payment, { foreignKey: 'loanId' });

module.exports = Payment;