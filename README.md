# Vot

To start your Phoenix server:

  * Setup the project with `mix setup`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

### ClickHouse

`docker run -d --name clickhouse-local -p 8123:8123 -p 9000:9000 --ulimit nofile=262144:262144 yandex/clickhouse-server`
