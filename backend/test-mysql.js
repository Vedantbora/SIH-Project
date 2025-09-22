import mysql from 'mysql2/promise';

const testMySQL = async () => {
  try {
    console.log('Testing MySQL connection...');
    
    // Try different connection configurations
    const configs = [
      { host: 'localhost', user: 'root', password: '', database: 'mindquest_db' },
      { host: 'localhost', user: 'root', password: 'root', database: 'mindquest_db' },
      { host: 'localhost', user: 'root', password: 'password', database: 'mindquest_db' },
      { host: 'localhost', user: 'root', password: '', database: 'mysql' }
    ];
    
    for (const config of configs) {
      try {
        console.log(`\nTrying config: ${config.user}@${config.host}/${config.database}`);
        const connection = await mysql.createConnection(config);
        
        // Test basic query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Connection successful!', rows);
        
        // Check if mindquest_db exists
        const [dbs] = await connection.execute('SHOW DATABASES');
        const dbNames = dbs.map(db => db.Database);
        console.log('Available databases:', dbNames);
        
        if (dbNames.includes('mindquest_db')) {
          console.log('✅ mindquest_db exists!');
          
          // Check tables in mindquest_db
          const [tables] = await connection.execute('SHOW TABLES');
          console.log('Tables in mindquest_db:', tables);
        } else {
          console.log('❌ mindquest_db does not exist');
        }
        
        await connection.end();
        return config; // Return the working config
        
      } catch (error) {
        console.log('❌ Failed:', error.message);
      }
    }
    
    console.log('\n❌ No working MySQL configuration found');
    
  } catch (error) {
    console.error('❌ MySQL test failed:', error);
  }
};

testMySQL();

