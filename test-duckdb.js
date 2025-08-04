import * as duckdb from '@duckdb/duckdb-wasm'

async function testDuckDB() {
  console.log('Testing DuckDB WASM initialization...')
  
  try {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles()
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)
    
    // Fetch the worker script to avoid CORS issues
    const workerResponse = await fetch(bundle.mainWorker)
    const workerScript = await workerResponse.text()
    const workerBlob = new Blob([workerScript], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(workerBlob)
    
    const worker = new Worker(workerUrl)
    const logger = new duckdb.ConsoleLogger()
    const db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule)
    const conn = await db.connect()
    
    console.log('✅ DuckDB WASM initialized successfully')
    
    // Test prepared statements
    await conn.query('CREATE TABLE test (id VARCHAR, content VARCHAR)')
    const stmt = await conn.prepare('INSERT INTO test VALUES ($1, $2)')
    
    // Test with problematic characters
    await stmt.query('test1', "This has 'quotes' and special chars: åOFùJGù")
    await stmt.query('test2', 'Another test with "double quotes"')
    
    await stmt.close()
    
    const result = await conn.query('SELECT * FROM test')
    console.log('✅ Prepared statements working:', result.toArray())
    
    await conn.close()
    await db.terminate()
    URL.revokeObjectURL(workerUrl)
    
    console.log('✅ All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDuckDB()