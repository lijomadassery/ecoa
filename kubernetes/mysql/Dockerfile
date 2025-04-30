FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    mysql-server \
    && rm -rf /var/lib/apt/lists/*

COPY my.cnf /etc/mysql/my.cnf

RUN mkdir -p /var/run/mysqld \
    && chown -R mysql:mysql /var/run/mysqld \
    && chmod 777 /var/run/mysqld

EXPOSE 3306

CMD ["mysqld"] 