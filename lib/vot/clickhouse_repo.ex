defmodule Vot.ClickhouseRepo do
  use Ecto.Repo,
    otp_app: :vot,
    adapter: ClickhouseEcto
end
