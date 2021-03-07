defmodule Vot.Repo do
  use Ecto.Repo,
    otp_app: :vot,
    adapter: Ecto.Adapters.Postgres
end
