defmodule Vot.Event do
  use Ecto.Schema
  import Ecto.Changeset

  schema "events" do
    field :event, :string
    field :event_code, :integer
    field :ip, :string
    field :session, :string
    field :ts, :integer
    field :type, :string
    field :user_agent, :string
    field :browser, :string
    field :device, :string
    field :os, :string
    field :video_id, :string
    field :video_name, :string
    field :video_type, :string
    field :category_name, :string
    field :sub_category_name, :string
    field :duration, :integer
    field :clientWidth, :integer
    field :clientHeight, :integer
    field :src, :string

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:type, :event, :session, :ip, :ts, :user_agent, :browser, :device, :os,:video_id,:video_name,:video_type,:category_name,:sub_category_name,:duration,:clientWidth,:clientHeight,:src, :event_code])
    |> validate_required([:type, :event, :session])
  end
end
