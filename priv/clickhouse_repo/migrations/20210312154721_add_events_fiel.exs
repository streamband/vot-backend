defmodule Vot.ClickhouseRepo.Migrations.AddEventsFiel do
  use Ecto.Migration

  def change do
    alter table("events") do
      add :event_value, :string
      add :event_code, :string
    end
  end
end
