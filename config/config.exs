# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :vot,
  ecto_repos: [Vot.Repo, Vot.ClickhouseRepo]

# Configures the endpoint
config :vot, VotWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "sWvHh03mukWC1AhFhLqfh+0/hx7m9d8Y0PIcTR1o57OfcDggoYdsm0iTRdbdqi+O",
  render_errors: [view: VotWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Vot.PubSub,
  live_view: [signing_salt: "dCKLe+Ju"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
