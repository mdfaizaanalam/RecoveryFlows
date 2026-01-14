const app = require('./app');
const PORT = process.env.PORT || 5000;
const { sequelize } = require('./models');

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database connected & synchronized successfully');
    console.log('✅ Tables ready: Users, Customers, Loans, Payments, etc.');
    
    // ✅ Start covenant scheduler (only once)
    try {
      const { startCovenantScheduler } = require('./jobs/covenantScheduler');
      startCovenantScheduler();
    } catch (err) {
      console.error('⚠️ Covenant scheduler error:', err.message);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });
