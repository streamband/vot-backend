defmodule Receiver.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events) do
      add :type, :string
      add :event, :string
      add :session, :string
      add :ip, :string
      add :ts, :integer

      timestamps()
    end

  end
end
