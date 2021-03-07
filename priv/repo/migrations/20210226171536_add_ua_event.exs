defmodule Receiver.Repo.Migrations.AddUaEvent do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE public.events ADD COLUMN user_agent varchar"
  end
end
