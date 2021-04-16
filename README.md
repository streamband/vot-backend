# Vot

To start your Phoenix server:

  * Setup the project with `mix setup`
  * Start Phoenix endpoint with `mix phx.server`
  * Start dev `make dev`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Add migration `mix ecto.migrate -r Vot.ClickHouseRepo`
`mix ecto.gen.migration add.. -r Vot.ClickHouseRepo`
### ClickHouse

`docker run -d --name clickhouse-local -p 8123:8123 -p 9000:9000 --ulimit nofile=262144:262144 yandex/clickhouse-server`
