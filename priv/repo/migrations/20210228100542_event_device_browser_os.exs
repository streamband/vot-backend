defmodule Receiver.Repo.Migrations.EventDeviceBrowserOs do
  use Ecto.Migration

  def change do
    alter table("events") do
      add :browser, :string
      add :device, :string
      add :os, :string
    end
  end
end
