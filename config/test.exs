use Mix.Config

# Only in tests, remove the complexity from the password hashing algorithm
config :bcrypt_elixir, :log_rounds, 1

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :vot, Vot.Repo,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :vot, Vot.ClickhouseRepo,
  adapter: ClickhouseEcto,
  loggers: [Ecto.LogEntry],
  hostname: "localhost",
  port: 8123,
  database: "default",
  username: "default",
  password: "",
  timeout: 60_000,
  pool_timeout: 60_000,
  ownership_timeout: 60_000,
  pool_size: 5

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :vot, VotWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn
