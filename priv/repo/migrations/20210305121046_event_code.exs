defmodule Receiver.Repo.Migrations.EventCode do
  use Ecto.Migration

  def change do
    alter table("events") do
      add :event_code, :integer
    end
  end
end
