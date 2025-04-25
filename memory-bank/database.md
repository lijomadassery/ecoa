# MySQL Database Configuration

## Database Setup

### Installation
1. Install MySQL 8.0+ from official sources
2. Set up root password
3. Create database user for application
4. Create database with UTF-8 encoding

### Configuration
```sql
-- Create database
CREATE DATABASE ecoa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'ecoa_user'@'localhost' 
  IDENTIFIED BY 'your_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON ecoa_db.* 
  TO 'ecoa_user'@'localhost';

FLUSH PRIVILEGES;
```

## Performance Optimization

### InnoDB Settings
```ini
# Buffer Pool Size (75% of available RAM for dedicated DB server)
innodb_buffer_pool_size=1G

# Buffer Pool Instances
innodb_buffer_pool_instances=8

# Log File Size
innodb_log_file_size=256M

# Log Buffer Size
innodb_log_buffer_size=16M

# Flush Method
innodb_flush_method=O_DIRECT

# File Per Table
innodb_file_per_table=1
```

### Connection Pool
```ini
# Max Connections
max_connections=200

# Thread Cache
thread_cache_size=16

# Connection Timeout
wait_timeout=28800
```

## Backup Configuration

### Binary Logging
```ini
# Enable Binary Logging
log-bin=mysql-bin

# Binary Log Format
binlog_format=ROW

# Binary Log Expiration
expire_logs_days=14
```

### Backup Script
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backup/dir"

# Create backup
mysqldump -u ecoa_user -p ecoa_db \
  --single-transaction \
  --quick \
  --lock-tables=false \
  > "$BACKUP_DIR/ecoa_db_$TIMESTAMP.sql"

# Compress backup
gzip "$BACKUP_DIR/ecoa_db_$TIMESTAMP.sql"
```

## Monitoring

### Key Metrics
1. Buffer pool hit ratio
2. Slow queries
3. Table locks
4. Connection usage
5. Query cache efficiency

### Slow Query Log
```ini
# Enable Slow Query Log
slow_query_log=1
slow_query_log_file=/var/log/mysql/mysql-slow.log
long_query_time=2
```

## Security Settings

### Basic Security
```ini
# Disable remote root login
bind-address=127.0.0.1

# Secure Authentication
secure-auth=ON

# SSL Configuration
ssl=ON
ssl-ca=/path/to/ca.pem
ssl-cert=/path/to/server-cert.pem
ssl-key=/path/to/server-key.pem
```

### User Permissions
```sql
-- Create read-only user for reporting
CREATE USER 'ecoa_reader'@'localhost' 
  IDENTIFIED BY 'reader_password';

GRANT SELECT ON ecoa_db.* 
  TO 'ecoa_reader'@'localhost';
```

## Maintenance

### Regular Tasks
1. Analyze tables
2. Optimize tables
3. Check and repair tables
4. Monitor log sizes
5. Review user permissions

### Maintenance Script
```sql
-- Analyze all tables
ANALYZE TABLE table_name;

-- Optimize tables
OPTIMIZE TABLE table_name;

-- Check tables
CHECK TABLE table_name;
``` 