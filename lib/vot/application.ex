defmodule Vot.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Vot.Repo,
      Vot.ClickhouseRepo,
      # Start the Telemetry supervisor
      VotWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Vot.PubSub},
      # Start the Endpoint (http/https)
      VotWeb.Endpoint
      # Start a worker by calling: Vot.Worker.start_link(arg)
      # {Vot.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Vot.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    VotWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
