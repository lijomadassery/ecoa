FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-server \
    && rm -rf /var/lib/apt/lists/*

COPY my.cnf /etc/mysql/my.cnf

# Initialize the MySQL data directory and create system tables
RUN mkdir -p /var/run/mysqld /var/lib/mysql && \
    chown -R mysql:mysql /var/run/mysqld /var/lib/mysql && \
    chmod 777 /var/run/mysqld && \
    # Initialize MySQL system tables
    mysql_install_db --user=mysql --datadir=/var/lib/mysql && \
    # Start MySQL server temporarily
    mysqld --user=mysql --datadir=/var/lib/mysql & \
    # Wait for MySQL to start
    until mysqladmin ping 2>/dev/null; do sleep 1; done && \
    # Initialize system tables and secure installation
    mysql -e "CREATE USER 'root'@'%' IDENTIFIED BY 'root'; GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;" && \
    # Stop MySQL
    mysqladmin shutdown

EXPOSE 3306

USER mysql

CMD ["mysqld", "--user=mysql", "--datadir=/var/lib/mysql"] 