defmodule Receiver.Repo.Migrations.EventsInitEvents do
  use Ecto.Migration

  def change do
    alter table("events") do
      add :video_id, :string
      add :video_name, :string
      add :video_type, :string
      add :category_name, :string
      add :sub_category_name, :string
      add :duration, :integer
      add :clientWidth, :integer
      add :clientHeight, :integer
      add :src, :string
    end
  end
end
